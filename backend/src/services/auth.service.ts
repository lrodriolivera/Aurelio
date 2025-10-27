// =========================================
// Authentication Service
// Business Logic Layer
// =========================================

import database from '../config/database';
import redis from '../config/redis';
import ApiError from '../utils/ApiError';
import PasswordUtils from '../utils/password';
import JwtUtils from '../utils/jwt';
import logger from '../utils/logger';
import {
  User,
  AuthUser,
  LoginCredentials,
  AuthResponse,
  TokenPayload,
} from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const result = await database.query<User>(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await PasswordUtils.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    // Update last login
    await database.query('UPDATE users SET last_login = NOW() WHERE id = $1', [
      user.id,
    ]);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = JwtUtils.generateToken(tokenPayload);
    const refreshToken = JwtUtils.generateRefreshToken(tokenPayload);

    // Store refresh token in Redis
    await redis.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

    // Prepare user response
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    };

    logger.info(`User logged in: ${user.email}`);

    return {
      user: authUser,
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // Verify refresh token
    const payload = JwtUtils.verifyRefreshToken(refreshToken);

    // Check if refresh token exists in Redis
    const storedToken = await redis.get(`refresh_token:${payload.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw ApiError.unauthorized('Refresh token inválido');
    }

    // Get user
    const result = await database.query<User>(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      throw ApiError.unauthorized('Usuario no encontrado');
    }

    const user = result.rows[0];

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newToken = JwtUtils.generateToken(tokenPayload);
    const newRefreshToken = JwtUtils.generateRefreshToken(tokenPayload);

    // Update refresh token in Redis
    await redis.set(`refresh_token:${user.id}`, newRefreshToken, 7 * 24 * 60 * 60);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    };

    return {
      user: authUser,
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    // Remove refresh token from Redis
    await redis.del(`refresh_token:${userId}`);
    logger.info(`User logged out: ${userId}`);
  }

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const result = await database.query<User>(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    const user = result.rows[0];

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Validate new password
    const validation = PasswordUtils.validate(newPassword);
    if (!validation.valid) {
      throw ApiError.badRequest(validation.errors.join(', '));
    }

    // Get user
    const result = await database.query<User>('SELECT * FROM users WHERE id = $1', [
      userId,
    ]);

    if (result.rows.length === 0) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    const user = result.rows[0];

    // Verify current password
    const isPasswordValid = await PasswordUtils.compare(
      currentPassword,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Contraseña actual incorrecta');
    }

    // Hash new password
    const newPasswordHash = await PasswordUtils.hash(newPassword);

    // Update password
    await database.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      newPasswordHash,
      userId,
    ]);

    // Invalidate all refresh tokens
    await redis.del(`refresh_token:${userId}`);

    logger.info(`Password changed for user: ${userId}`);
  }

  async createUser(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: User['role'];
    phone?: string;
  }): Promise<AuthUser> {
    // Validate password
    const validation = PasswordUtils.validate(data.password);
    if (!validation.valid) {
      throw ApiError.badRequest(validation.errors.join(', '));
    }

    // Check if email already exists
    const existingUser = await database.query('SELECT id FROM users WHERE email = $1', [
      data.email,
    ]);

    if (existingUser.rows.length > 0) {
      throw ApiError.conflict('El email ya está registrado');
    }

    // Hash password
    const passwordHash = await PasswordUtils.hash(data.password);

    // Create user
    const result = await database.query<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, first_name, last_name, role`,
      [data.email, passwordHash, data.first_name, data.last_name, data.role, data.phone]
    );

    const user = result.rows[0];

    logger.info(`New user created: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    };
  }
}

export default new AuthService();

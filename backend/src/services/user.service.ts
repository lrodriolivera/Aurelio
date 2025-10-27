// =========================================
// User Service
// Business Logic for User Management
// =========================================

import database from '../config/database';
import logger from '../utils/logger';
import bcrypt from 'bcrypt';
import { ApiError } from '../utils/ApiError';

export interface CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'operator' | 'warehouse';
  phone?: string;
}

export interface UpdateUserDto {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'operator' | 'warehouse';
  phone?: string;
  is_active?: boolean;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

class UserService {
  /**
   * Get all users with pagination
   */
  async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause = `WHERE (
        email ILIKE $${paramIndex} OR
        first_name ILIKE $${paramIndex} OR
        last_name ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await database.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      search ? queryParams : []
    );
    const total = parseInt(countResult.rows[0].count);

    // Get users
    const usersResult = await database.query(
      `SELECT
        id, email, first_name, last_name, role, phone,
        is_active, last_login, created_at, updated_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    return {
      users: usersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const result = await database.query(
      `SELECT
        id, email, first_name, last_name, role, phone,
        is_active, last_login, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    return result.rows[0];
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserDto, createdBy?: string): Promise<User> {
    const { email, password, first_name, last_name, role, phone } = data;

    // Check if email already exists
    const existingUser = await database.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw ApiError.badRequest('El correo electrónico ya está en uso');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await database.query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, role, phone, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, email, first_name, last_name, role, phone, is_active, created_at, updated_at`,
      [email, password_hash, first_name, last_name, role, phone]
    );

    const user = result.rows[0];
    logger.info(`User created: ${user.id} - ${user.email} by ${createdBy || 'system'}`);

    return user;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const { email, first_name, last_name, role, phone, is_active } = data;

    // Check if user exists
    await this.getUserById(userId);

    // Check if new email is already in use by another user
    if (email) {
      const existingUser = await database.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (existingUser.rows.length > 0) {
        throw ApiError.badRequest('El correo electrónico ya está en uso');
      }
    }

    // Build update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (first_name !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(first_name);
    }
    if (last_name !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(last_name);
    }
    if (role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await database.query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, first_name, last_name, role, phone, is_active, last_login, created_at, updated_at`,
      values
    );

    logger.info(`User updated: ${userId}`);
    return result.rows[0];
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    const { current_password, new_password } = data;

    // Get user with password hash
    const result = await database.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    const user = result.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      throw ApiError.badRequest('Contraseña actual incorrecta');
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    await database.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [new_password_hash, userId]
    );

    logger.info(`Password changed for user: ${userId}`);
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(userId: string, new_password: string): Promise<void> {
    // Check if user exists
    await this.getUserById(userId);

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    await database.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [password_hash, userId]
    );

    logger.info(`Password reset for user: ${userId}`);
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    // Check if user exists
    await this.getUserById(userId);

    // Soft delete by deactivating
    await database.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    logger.info(`User deactivated: ${userId}`);
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const result = await database.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'operator' THEN 1 END) as operators,
        COUNT(CASE WHEN role = 'warehouse' THEN 1 END) as warehouse
      FROM users
    `);

    return result.rows[0];
  }
}

export default new UserService();

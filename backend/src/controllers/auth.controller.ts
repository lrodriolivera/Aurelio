// =========================================
// Authentication Controller
// HTTP Request Handlers
// =========================================

import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthRequest, LoginCredentials } from '../types';
import ApiError from '../utils/ApiError';

class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;

      if (!credentials.email || !credentials.password) {
        throw ApiError.badRequest('Email y contraseña son requeridos');
      }

      const result = await authService.login(credentials);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Inicio de sesión exitoso',
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw ApiError.badRequest('Refresh token es requerido');
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Token renovado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Usuario no autenticado');
      }

      await authService.logout(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Usuario no autenticado');
      }

      const user = await authService.getCurrentUser(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Usuario no autenticado');
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw ApiError.badRequest('Contraseña actual y nueva contraseña son requeridas');
      }

      await authService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, first_name, last_name, role, phone } = req.body;

      if (!email || !password || !first_name || !last_name || !role) {
        throw ApiError.badRequest('Todos los campos requeridos deben ser proporcionados');
      }

      const user = await authService.createUser({
        email,
        password,
        first_name,
        last_name,
        role,
        phone,
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuario creado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

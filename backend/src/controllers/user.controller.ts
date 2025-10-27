// =========================================
// User Controller
// HTTP Request Handlers for User Management
// =========================================

import { Request, Response } from 'express';
import userService from '../services/user.service';
import logger from '../utils/logger';
import { ApiError } from '../utils/ApiError';

/**
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await userService.getAllUsers(page, limit, search);

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`Error getting users: ${error}`);
    throw ApiError.internal('Error al obtener usuarios');
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`Error getting user: ${error}`);
    throw error;
  }
};

/**
 * Create new user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const createdBy = (req as any).user?.userId;

    const user = await userService.createUser(userData, createdBy);

    res.status(201).json({
      success: true,
      data: user,
      message: 'Usuario creado exitosamente',
    });
  } catch (error) {
    logger.error(`Error creating user: ${error}`);
    throw error;
  }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const user = await userService.updateUser(id, userData);

    res.json({
      success: true,
      data: user,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error) {
    logger.error(`Error updating user: ${error}`);
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const passwordData = req.body;

    // Users can only change their own password unless they're admin
    const requestingUserId = (req as any).user?.userId;
    const requestingUserRole = (req as any).user?.role;

    if (requestingUserId !== id && requestingUserRole !== 'admin') {
      throw ApiError.forbidden('No tienes permiso para cambiar la contraseña de otro usuario');
    }

    await userService.changePassword(id, passwordData);

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente',
    });
  } catch (error) {
    logger.error(`Error changing password: ${error}`);
    throw error;
  }
};

/**
 * Reset password (admin only)
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      throw ApiError.badRequest('La nueva contraseña es requerida');
    }

    await userService.resetPassword(id, new_password);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente',
    });
  } catch (error) {
    logger.error(`Error resetting password: ${error}`);
    throw error;
  }
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent user from deleting themselves
    const requestingUserId = (req as any).user?.userId;
    if (requestingUserId === id) {
      throw ApiError.badRequest('No puedes desactivar tu propia cuenta');
    }

    await userService.deleteUser(id);

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error}`);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error getting user stats: ${error}`);
    throw ApiError.internal('Error al obtener estadísticas de usuarios');
  }
};

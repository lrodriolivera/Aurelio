// =========================================
// Authentication Middleware
// =========================================

import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import JwtUtils from '../utils/jwt';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = JwtUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw ApiError.unauthorized('Token no proporcionado');
    }

    const payload = JwtUtils.verifyToken(token);

    // Attach user to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      first_name: '',
      last_name: '',
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Usuario no autenticado');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw ApiError.forbidden('No tiene permisos para realizar esta acción');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = JwtUtils.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      try {
        const payload = JwtUtils.verifyToken(token);
        req.user = {
          id: payload.userId,
          email: payload.email,
          first_name: '',
          last_name: '',
          role: payload.role,
        };
      } catch (error) {
        // Token invalid but continue anyway (optional auth)
        logger.debug('Optional auth token invalid, continuing without user');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default { authenticate, authorize, optionalAuth };

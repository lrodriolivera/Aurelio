// =========================================
// JWT Utilities
// =========================================

import jwt from 'jsonwebtoken';
import config from '../config';
import { TokenPayload } from '../types';
import ApiError from './ApiError';

export class JwtUtils {
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.unauthorized('Token inválido');
      }
      throw ApiError.unauthorized('Error de autenticación');
    }
  }

  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Refresh token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.unauthorized('Refresh token inválido');
      }
      throw ApiError.unauthorized('Error de autenticación');
    }
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

export default JwtUtils;

// =========================================
// Custom API Error Class
// =========================================

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'No autorizado'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Acceso prohibido'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Recurso no encontrado'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static internal(message = 'Error interno del servidor'): ApiError {
    return new ApiError(500, message, false);
  }
}

export default ApiError;

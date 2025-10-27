// =========================================
// Tracking Controller
// HTTP Request Handlers for Tracking
// =========================================

import { Request, Response } from 'express';
import trackingService from '../services/tracking.service';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

/**
 * Track by tracking number (order or package)
 * GET /api/tracking/:trackingNumber
 */
export const track = async (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
      throw ApiError.badRequest('Número de seguimiento requerido');
    }

    // Determine if it's an order or package number
    // Order numbers start with "OR-", package numbers start with "OR-" and contain "-P"
    let result;

    if (trackingNumber.includes('-P')) {
      // Package number
      result = await trackingService.trackByPackageNumber(trackingNumber);
    } else if (trackingNumber.startsWith('OR-')) {
      // Order number
      const orderTracking = await trackingService.trackByOrderNumber(trackingNumber);
      result = { order: orderTracking };
    } else {
      throw ApiError.badRequest('Número de seguimiento inválido');
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(`Error tracking: ${error}`);
    throw ApiError.internal('Error al consultar seguimiento');
  }
};

/**
 * Track by order number
 * GET /api/tracking/order/:orderNumber
 */
export const trackByOrder = async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const result = await trackingService.trackByOrderNumber(orderNumber);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(`Error tracking order: ${error}`);
    throw ApiError.internal('Error al consultar orden');
  }
};

/**
 * Track by package number
 * GET /api/tracking/package/:packageNumber
 */
export const trackByPackage = async (req: Request, res: Response) => {
  try {
    const { packageNumber } = req.params;
    const result = await trackingService.trackByPackageNumber(packageNumber);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(`Error tracking package: ${error}`);
    throw ApiError.internal('Error al consultar bulto');
  }
};

/**
 * Get recent tracking events
 * GET /api/tracking/events
 */
export const getRecentEvents = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const events = await trackingService.getRecentEvents(limit);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    logger.error(`Error getting tracking events: ${error}`);
    throw ApiError.internal('Error al obtener eventos');
  }
};

/**
 * Get tracking statistics
 * GET /api/tracking/stats
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await trackingService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error getting tracking stats: ${error}`);
    throw ApiError.internal('Error al obtener estadísticas');
  }
};

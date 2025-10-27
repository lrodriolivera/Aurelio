// =========================================
// Delivery Controller
// HTTP Request Handlers for Deliveries
// =========================================

import { Request, Response } from 'express';
import deliveryService from '../services/delivery.service';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

/**
 * Get packages ready for delivery/pickup
 * GET /api/deliveries/ready
 */
export const getReadyPackages = async (req: Request, res: Response) => {
  try {
    const { destination } = req.query;
    const packages = await deliveryService.getReadyPackages(
      destination as string
    );

    res.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    logger.error(`Error getting ready packages: ${error}`);
    throw ApiError.internal('Error al obtener bultos listos');
  }
};

/**
 * Register a delivery or pickup
 * POST /api/deliveries
 */
export const createDelivery = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const delivery = await deliveryService.createDelivery(req.body, userId);

    res.status(201).json({
      success: true,
      data: delivery,
      message: 'Entrega registrada exitosamente',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(`Error creating delivery: ${error}`);
    throw ApiError.internal('Error al registrar entrega');
  }
};

/**
 * Get delivery history
 * GET /api/deliveries
 */
export const getDeliveries = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const delivery_type = req.query.delivery_type as string;
    const search = req.query.search as string;

    const result = await deliveryService.getDeliveries({
      page,
      limit,
      delivery_type,
      search,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(`Error getting deliveries: ${error}`);
    throw ApiError.internal('Error al obtener entregas');
  }
};

/**
 * Get delivery by ID
 * GET /api/deliveries/:id
 */
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const delivery = await deliveryService.getById(id);

    res.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(`Error getting delivery: ${error}`);
    throw ApiError.internal('Error al obtener entrega');
  }
};

/**
 * Get delivery statistics
 * GET /api/deliveries/stats
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await deliveryService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error getting delivery stats: ${error}`);
    throw ApiError.internal('Error al obtener estadísticas');
  }
};

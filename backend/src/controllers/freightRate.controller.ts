// =========================================
// Freight Rate Controller
// HTTP Request Handlers for Freight Rate Management
// =========================================

import { Request, Response } from 'express';
import freightRateService from '../services/freightRate.service';
import logger from '../utils/logger';
import { ApiError } from '../utils/ApiError';

/**
 * Get all freight rates
 */
export const getAllRates = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await freightRateService.getAllRates(page, limit, search);

    res.json({
      success: true,
      data: result.rates,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`Error getting freight rates: ${error}`);
    throw ApiError.internal('Error al obtener tarifas de flete');
  }
};

/**
 * Get freight rate by ID
 */
export const getRateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rate = await freightRateService.getRateById(id);

    res.json({
      success: true,
      data: rate,
    });
  } catch (error) {
    logger.error(`Error getting freight rate: ${error}`);
    throw error;
  }
};

/**
 * Get active rates for a route
 */
export const getActiveRatesForRoute = async (req: Request, res: Response) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      throw ApiError.badRequest('Origen y destino son requeridos');
    }

    const rates = await freightRateService.getActiveRatesForRoute(
      origin as string,
      destination as string
    );

    res.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    logger.error(`Error getting active rates for route: ${error}`);
    throw error;
  }
};

/**
 * Create new freight rate
 */
export const createRate = async (req: Request, res: Response) => {
  try {
    const rateData = req.body;
    const createdBy = (req as any).user?.userId;

    const rate = await freightRateService.createRate(rateData, createdBy);

    res.status(201).json({
      success: true,
      data: rate,
      message: 'Tarifa de flete creada exitosamente',
    });
  } catch (error) {
    logger.error(`Error creating freight rate: ${error}`);
    throw error;
  }
};

/**
 * Update freight rate
 */
export const updateRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rateData = req.body;

    const rate = await freightRateService.updateRate(id, rateData);

    res.json({
      success: true,
      data: rate,
      message: 'Tarifa de flete actualizada exitosamente',
    });
  } catch (error) {
    logger.error(`Error updating freight rate: ${error}`);
    throw error;
  }
};

/**
 * Delete freight rate (soft delete)
 */
export const deleteRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await freightRateService.deleteRate(id);

    res.json({
      success: true,
      message: 'Tarifa de flete desactivada exitosamente',
    });
  } catch (error) {
    logger.error(`Error deleting freight rate: ${error}`);
    throw error;
  }
};

/**
 * Get freight rate statistics
 */
export const getRateStats = async (req: Request, res: Response) => {
  try {
    const stats = await freightRateService.getRateStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error getting freight rate stats: ${error}`);
    throw ApiError.internal('Error al obtener estadísticas de tarifas');
  }
};

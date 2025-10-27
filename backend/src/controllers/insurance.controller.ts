// =========================================
// Insurance Controller
// HTTP Request Handlers for Insurance Configuration Management
// =========================================

import { Request, Response } from 'express';
import insuranceService from '../services/insurance.service';
import logger from '../utils/logger';
import { ApiError } from '../utils/ApiError';

/**
 * Get all insurance configurations
 */
export const getAllConfigs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await insuranceService.getAllConfigs(page, limit, search);

    res.json({
      success: true,
      data: result.configs,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`Error getting insurance configs: ${error}`);
    throw ApiError.internal('Error al obtener configuraciones de seguro');
  }
};

/**
 * Get insurance config by ID
 */
export const getConfigById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await insuranceService.getConfigById(id);

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error(`Error getting insurance config: ${error}`);
    throw error;
  }
};

/**
 * Get active insurance configuration
 */
export const getActiveConfig = async (req: Request, res: Response) => {
  try {
    const config = await insuranceService.getActiveConfig();

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error(`Error getting active insurance config: ${error}`);
    throw error;
  }
};

/**
 * Create new insurance configuration
 */
export const createConfig = async (req: Request, res: Response) => {
  try {
    const configData = req.body;
    const createdBy = (req as any).user?.userId;

    const config = await insuranceService.createConfig(configData, createdBy);

    res.status(201).json({
      success: true,
      data: config,
      message: 'Configuración de seguro creada exitosamente',
    });
  } catch (error) {
    logger.error(`Error creating insurance config: ${error}`);
    throw error;
  }
};

/**
 * Update insurance configuration
 */
export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const configData = req.body;

    const config = await insuranceService.updateConfig(id, configData);

    res.json({
      success: true,
      data: config,
      message: 'Configuración de seguro actualizada exitosamente',
    });
  } catch (error) {
    logger.error(`Error updating insurance config: ${error}`);
    throw error;
  }
};

/**
 * Delete insurance configuration
 */
export const deleteConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await insuranceService.deleteConfig(id);

    res.json({
      success: true,
      message: 'Configuración de seguro eliminada exitosamente',
    });
  } catch (error) {
    logger.error(`Error deleting insurance config: ${error}`);
    throw error;
  }
};

/**
 * Get insurance configuration statistics
 */
export const getConfigStats = async (req: Request, res: Response) => {
  try {
    const stats = await insuranceService.getConfigStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error getting insurance config stats: ${error}`);
    throw ApiError.internal('Error al obtener estadísticas de configuraciones de seguro');
  }
};

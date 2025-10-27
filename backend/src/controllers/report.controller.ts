// =========================================
// Report Controller
// HTTP Request Handlers for Reports
// =========================================

import { Request, Response } from 'express';
import reportService from '../services/report.service';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

/**
 * Get orders report
 * GET /api/reports/orders
 */
export const getOrdersReport = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    const report = await reportService.getOrdersReport({
      start_date: start_date as string,
      end_date: end_date as string,
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error(`Error getting orders report: ${error}`);
    throw ApiError.internal('Error al obtener reporte de órdenes');
  }
};

/**
 * Get shipments report
 * GET /api/reports/shipments
 */
export const getShipmentsReport = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    const report = await reportService.getShipmentsReport({
      start_date: start_date as string,
      end_date: end_date as string,
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error(`Error getting shipments report: ${error}`);
    throw ApiError.internal('Error al obtener reporte de envíos');
  }
};

/**
 * Get deliveries report
 * GET /api/reports/deliveries
 */
export const getDeliveriesReport = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    const report = await reportService.getDeliveriesReport({
      start_date: start_date as string,
      end_date: end_date as string,
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error(`Error getting deliveries report: ${error}`);
    throw ApiError.internal('Error al obtener reporte de entregas');
  }
};

/**
 * Get general statistics
 * GET /api/reports/stats
 */
export const getGeneralStats = async (req: Request, res: Response) => {
  try {
    const stats = await reportService.getGeneralStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error getting general stats: ${error}`);
    throw ApiError.internal('Error al obtener estadísticas generales');
  }
};

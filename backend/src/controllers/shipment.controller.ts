// =========================================
// Shipment Controller
// HTTP Request Handlers
// =========================================

import { Response, NextFunction } from 'express';
import shipmentService from '../services/shipment.service';
import { AuthRequest } from '../types';
import ApiError from '../utils/ApiError';

class ShipmentController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await shipmentService.getAll({
        page,
        limit,
        search,
        filters: { status },
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const shipment = await shipmentService.getById(id);

      res.status(200).json({
        success: true,
        data: shipment,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Usuario no autenticado');
      }

      const data = req.body;

      // Validate required fields
      if (!data.destination) {
        throw ApiError.badRequest('Destino es requerido');
      }

      const shipment = await shipmentService.create(data, req.user.id);

      res.status(201).json({
        success: true,
        data: shipment,
        message: 'Envío creado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async addOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Usuario no autenticado');
      }

      const { id } = req.params;
      const { order_id } = req.body;

      if (!order_id) {
        throw ApiError.badRequest('ID de orden es requerido');
      }

      const shipment = await shipmentService.addOrder(id, { order_id }, req.user.id);

      res.status(200).json({
        success: true,
        data: shipment,
        message: 'Orden agregada al envío',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, orderId } = req.params;

      const shipment = await shipmentService.removeOrder(id, orderId);

      res.status(200).json({
        success: true,
        data: shipment,
        message: 'Orden removida del envío',
      });
    } catch (error) {
      next(error);
    }
  }

  async scanPackage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Usuario no autenticado');
      }

      const { id } = req.params;
      const { package_number, location } = req.body;

      if (!package_number || !location) {
        throw ApiError.badRequest('Número de bulto y ubicación son requeridos');
      }

      const result = await shipmentService.scanPackage(
        id,
        { package_number, location },
        req.user.id
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async dispatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Usuario no autenticado');
      }

      const { id } = req.params;

      const shipment = await shipmentService.dispatch(id, req.user.id);

      res.status(200).json({
        success: true,
        data: shipment,
        message: 'Envío despachado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await shipmentService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ShipmentController();

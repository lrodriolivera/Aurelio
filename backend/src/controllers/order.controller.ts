// =========================================
// Order Controller
// HTTP Request Handlers
// =========================================

import { Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import { AuthRequest, CreateOrderDto } from '../types';
import ApiError from '../utils/ApiError';

class OrderController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await orderService.getAll({
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
      const order = await orderService.getById(id);

      res.status(200).json({
        success: true,
        data: order,
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

      const data: CreateOrderDto = req.body;

      // Validate required fields
      if (!data.customer_id || !data.declared_value || !data.destination || !data.packages) {
        throw ApiError.badRequest('Faltan campos requeridos');
      }

      const order = await orderService.create(data, req.user.id);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Orden creada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Usuario no autenticado');
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw ApiError.badRequest('Estado es requerido');
      }

      const order = await orderService.updateStatus(id, status, req.user.id);

      res.status(200).json({
        success: true,
        data: order,
        message: 'Estado actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await orderService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();

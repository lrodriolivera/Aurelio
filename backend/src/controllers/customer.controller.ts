// =========================================
// Customer Controller
// HTTP Request Handlers
// =========================================

import { Response, NextFunction } from 'express';
import customerService from '../services/customer.service';
import { AuthRequest, CreateCustomerDto } from '../types';
import ApiError from '../utils/ApiError';

class CustomerController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await customerService.getAll({ page, limit, search });

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
      const customer = await customerService.getById(id);

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateCustomerDto = req.body;

      // Validate required fields
      if (!data.rut || !data.business_name) {
        throw ApiError.badRequest('RUT y nombre de empresa son requeridos');
      }

      const customer = await customerService.create(data);

      res.status(201).json({
        success: true,
        data: customer,
        message: 'Cliente creado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: Partial<CreateCustomerDto> = req.body;

      const customer = await customerService.update(id, data);

      res.status(200).json({
        success: true,
        data: customer,
        message: 'Cliente actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await customerService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Cliente eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await customerService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();

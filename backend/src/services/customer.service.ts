// =========================================
// Customer Service
// Business Logic for Customer Management
// =========================================

import database from '../config/database';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';
import { Customer, CreateCustomerDto, QueryParams, PaginatedResponse } from '../types';

class CustomerService {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Customer>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;
    const search = params?.search || '';

    let query = `
      SELECT * FROM customers
      WHERE is_active = true
    `;

    const queryParams: any[] = [];

    // Search filter
    if (search) {
      query += ` AND (
        business_name ILIKE $1 OR
        rut ILIKE $1 OR
        contact_name ILIKE $1 OR
        email ILIKE $1
      )`;
      queryParams.push(`%${search}%`);
    }

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await database.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await database.query<Customer>(query, queryParams);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string): Promise<Customer> {
    const result = await database.query<Customer>(
      'SELECT * FROM customers WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Cliente no encontrado');
    }

    return result.rows[0];
  }

  async getByRut(rut: string): Promise<Customer | null> {
    const result = await database.query<Customer>(
      'SELECT * FROM customers WHERE rut = $1 AND is_active = true',
      [rut]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    // Validate RUT is unique
    const existing = await this.getByRut(data.rut);
    if (existing) {
      throw ApiError.conflict('Ya existe un cliente con ese RUT');
    }

    const result = await database.query<Customer>(
      `INSERT INTO customers (
        rut, business_name, contact_name, email, phone, mobile,
        address, city, region, notes, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING *`,
      [
        data.rut,
        data.business_name,
        data.contact_name || null,
        data.email || null,
        data.phone || null,
        data.mobile || null,
        data.address || null,
        data.city || null,
        data.region || null,
        data.notes || null,
      ]
    );

    logger.info(`Customer created: ${result.rows[0].id} - ${result.rows[0].business_name}`);

    return result.rows[0];
  }

  async update(id: string, data: Partial<CreateCustomerDto>): Promise<Customer> {
    // Check if customer exists
    await this.getById(id);

    // If updating RUT, check uniqueness
    if (data.rut) {
      const existing = await this.getByRut(data.rut);
      if (existing && existing.id !== id) {
        throw ApiError.conflict('Ya existe otro cliente con ese RUT');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw ApiError.badRequest('No hay campos para actualizar');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE customers
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await database.query<Customer>(query, values);

    logger.info(`Customer updated: ${id}`);

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    const result = await database.query(
      'UPDATE customers SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw ApiError.notFound('Cliente no encontrado');
    }

    logger.info(`Customer soft deleted: ${id}`);
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const result = await database.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive
      FROM customers
    `);

    return {
      total: parseInt(result.rows[0].total),
      active: parseInt(result.rows[0].active),
      inactive: parseInt(result.rows[0].inactive),
    };
  }
}

export default new CustomerService();

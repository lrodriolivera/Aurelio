// =========================================
// Freight Rate Service
// Business Logic for Freight Rate Management
// =========================================

import database from '../config/database';
import logger from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { FreightRate } from '../types';

export interface CreateFreightRateDto {
  route_name: string;
  origin: string;
  destination: string;
  rate_per_kg: number;
  min_charge: number;
  effective_from: string; // ISO date string
  effective_to?: string; // ISO date string
}

export interface UpdateFreightRateDto {
  route_name?: string;
  origin?: string;
  destination?: string;
  rate_per_kg?: number;
  min_charge?: number;
  is_active?: boolean;
  effective_from?: string;
  effective_to?: string;
}

class FreightRateService {
  /**
   * Get all freight rates with pagination
   */
  async getAllRates(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause = `WHERE (
        route_name ILIKE $${paramIndex} OR
        origin ILIKE $${paramIndex} OR
        destination ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await database.query(
      `SELECT COUNT(*) FROM freight_rates ${whereClause}`,
      search ? queryParams : []
    );
    const total = parseInt(countResult.rows[0].count);

    // Get freight rates
    const ratesResult = await database.query(
      `SELECT * FROM freight_rates
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    return {
      rates: ratesResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get freight rate by ID
   */
  async getRateById(rateId: string): Promise<FreightRate> {
    const result = await database.query(
      'SELECT * FROM freight_rates WHERE id = $1',
      [rateId]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Tarifa no encontrada');
    }

    return result.rows[0];
  }

  /**
   * Get active rates for a specific route
   */
  async getActiveRatesForRoute(origin: string, destination: string) {
    const result = await database.query(
      `SELECT * FROM freight_rates
       WHERE origin = $1 AND destination = $2
       AND is_active = true
       AND (effective_to IS NULL OR effective_to > CURRENT_DATE)
       ORDER BY effective_from DESC`,
      [origin, destination]
    );

    return result.rows;
  }

  /**
   * Create new freight rate
   */
  async createRate(data: CreateFreightRateDto, createdBy?: string): Promise<FreightRate> {
    const { route_name, origin, destination, rate_per_kg, min_charge, effective_from, effective_to } = data;

    // Validate dates
    if (effective_to && new Date(effective_to) <= new Date(effective_from)) {
      throw ApiError.badRequest('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Create rate
    const result = await database.query(
      `INSERT INTO freight_rates (
        route_name, origin, destination, rate_per_kg, min_charge,
        effective_from, effective_to, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6::date, $7::date, true)
      RETURNING *`,
      [route_name, origin, destination, rate_per_kg, min_charge, effective_from, effective_to || null]
    );

    const rate = result.rows[0];
    logger.info(`Freight rate created: ${rate.id} - ${route_name} by ${createdBy || 'system'}`);

    return rate;
  }

  /**
   * Update freight rate
   */
  async updateRate(rateId: string, data: UpdateFreightRateDto): Promise<FreightRate> {
    // Check if rate exists
    await this.getRateById(rateId);

    // Validate dates if both are provided
    if (data.effective_from && data.effective_to) {
      if (new Date(data.effective_to) <= new Date(data.effective_from)) {
        throw ApiError.badRequest('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Build update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.route_name !== undefined) {
      fields.push(`route_name = $${paramIndex++}`);
      values.push(data.route_name);
    }
    if (data.origin !== undefined) {
      fields.push(`origin = $${paramIndex++}`);
      values.push(data.origin);
    }
    if (data.destination !== undefined) {
      fields.push(`destination = $${paramIndex++}`);
      values.push(data.destination);
    }
    if (data.rate_per_kg !== undefined) {
      fields.push(`rate_per_kg = $${paramIndex++}`);
      values.push(data.rate_per_kg);
    }
    if (data.min_charge !== undefined) {
      fields.push(`min_charge = $${paramIndex++}`);
      values.push(data.min_charge);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);
    }
    if (data.effective_from !== undefined) {
      fields.push(`effective_from = $${paramIndex++}::date`);
      values.push(data.effective_from);
    }
    if (data.effective_to !== undefined) {
      fields.push(`effective_to = $${paramIndex++}::date`);
      values.push(data.effective_to);
    }

    fields.push(`updated_at = NOW()`);
    values.push(rateId);

    const result = await database.query(
      `UPDATE freight_rates
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    logger.info(`Freight rate updated: ${rateId}`);
    return result.rows[0];
  }

  /**
   * Delete freight rate (soft delete)
   */
  async deleteRate(rateId: string): Promise<void> {
    // Check if rate exists
    await this.getRateById(rateId);

    // Soft delete by deactivating
    await database.query(
      'UPDATE freight_rates SET is_active = false, updated_at = NOW() WHERE id = $1',
      [rateId]
    );

    logger.info(`Freight rate deactivated: ${rateId}`);
  }

  /**
   * Get freight rate statistics
   */
  async getRateStats() {
    const result = await database.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive,
        AVG(rate_per_kg) as avg_rate_per_kg,
        AVG(min_charge) as avg_min_charge
      FROM freight_rates
    `);

    return result.rows[0];
  }
}

export default new FreightRateService();

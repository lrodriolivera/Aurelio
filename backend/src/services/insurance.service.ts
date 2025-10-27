// =========================================
// Insurance Service
// Business Logic for Insurance Configuration Management
// =========================================

import database from '../config/database';
import logger from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { InsuranceConfig } from '../types';

export interface CreateInsuranceConfigDto {
  name: string;
  rate: number; // Percentage as decimal (e.g., 0.01 for 1%)
  min_value: number;
}

export interface UpdateInsuranceConfigDto {
  name?: string;
  rate?: number;
  min_value?: number;
  is_active?: boolean;
}

class InsuranceService {
  /**
   * Get all insurance configurations with pagination
   */
  async getAllConfigs(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause = `WHERE name ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await database.query(
      `SELECT COUNT(*) FROM insurance_config ${whereClause}`,
      search ? queryParams : []
    );
    const total = parseInt(countResult.rows[0].count);

    // Get insurance configs
    const configsResult = await database.query(
      `SELECT * FROM insurance_config
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    return {
      configs: configsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get insurance config by ID
   */
  async getConfigById(configId: string): Promise<InsuranceConfig> {
    const result = await database.query(
      'SELECT * FROM insurance_config WHERE id = $1',
      [configId]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Configuración de seguro no encontrada');
    }

    return result.rows[0];
  }

  /**
   * Get active insurance configuration
   */
  async getActiveConfig(): Promise<InsuranceConfig | null> {
    const result = await database.query(
      `SELECT * FROM insurance_config
       WHERE is_active = true
       ORDER BY created_at DESC
       LIMIT 1`
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Create new insurance configuration
   */
  async createConfig(data: CreateInsuranceConfigDto, createdBy?: string): Promise<InsuranceConfig> {
    const { name, rate, min_value } = data;

    // Validate rate (should be between 0 and 1)
    if (rate < 0 || rate > 1) {
      throw ApiError.badRequest('La tasa de seguro debe estar entre 0 y 1 (0% a 100%)');
    }

    // Validate min_value
    if (min_value < 0) {
      throw ApiError.badRequest('El valor mínimo debe ser mayor o igual a 0');
    }

    // Deactivate all other configurations when creating a new one
    await database.query(
      'UPDATE insurance_config SET is_active = false WHERE is_active = true'
    );

    // Create config
    const result = await database.query(
      `INSERT INTO insurance_config (
        name, rate, min_value, is_active
      ) VALUES ($1, $2, $3, true)
      RETURNING *`,
      [name, rate, min_value]
    );

    const config = result.rows[0];
    logger.info(`Insurance config created: ${config.id} - ${name} by ${createdBy || 'system'}`);

    return config;
  }

  /**
   * Update insurance configuration
   */
  async updateConfig(configId: string, data: UpdateInsuranceConfigDto): Promise<InsuranceConfig> {
    // Check if config exists
    await this.getConfigById(configId);

    // Validate rate if provided
    if (data.rate !== undefined && (data.rate < 0 || data.rate > 1)) {
      throw ApiError.badRequest('La tasa de seguro debe estar entre 0 y 1 (0% a 100%)');
    }

    // Validate min_value if provided
    if (data.min_value !== undefined && data.min_value < 0) {
      throw ApiError.badRequest('El valor mínimo debe ser mayor o igual a 0');
    }

    // Build update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.rate !== undefined) {
      fields.push(`rate = $${paramIndex++}`);
      values.push(data.rate);
    }
    if (data.min_value !== undefined) {
      fields.push(`min_value = $${paramIndex++}`);
      values.push(data.min_value);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);

      // If activating this config, deactivate all others
      if (data.is_active) {
        await database.query(
          'UPDATE insurance_config SET is_active = false WHERE id != $1',
          [configId]
        );
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(configId);

    const result = await database.query(
      `UPDATE insurance_config
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    logger.info(`Insurance config updated: ${configId}`);
    return result.rows[0];
  }

  /**
   * Delete insurance configuration (soft delete)
   */
  async deleteConfig(configId: string): Promise<void> {
    // Check if config exists
    const config = await this.getConfigById(configId);

    // Prevent deletion of active config
    if (config.is_active) {
      throw ApiError.badRequest('No se puede eliminar la configuración activa');
    }

    // Delete config
    await database.query(
      'DELETE FROM insurance_config WHERE id = $1',
      [configId]
    );

    logger.info(`Insurance config deleted: ${configId}`);
  }

  /**
   * Get insurance configuration statistics
   */
  async getConfigStats() {
    const result = await database.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive,
        AVG(rate) as avg_rate,
        AVG(min_value) as avg_min_value
      FROM insurance_config
    `);

    return result.rows[0];
  }
}

export default new InsuranceService();

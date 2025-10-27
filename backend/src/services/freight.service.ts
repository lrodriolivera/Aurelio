// =========================================
// Freight Calculation Service
// Automatic freight and insurance calculation
// =========================================

import database from '../config/database';
import config from '../config';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';
import { FreightRate, InsuranceConfig, FreightCalculation } from '../types';

class FreightService {
  async getActiveRate(origin: string, destination: string): Promise<FreightRate | null> {
    const result = await database.query<FreightRate>(
      `SELECT * FROM freight_rates
       WHERE origin = $1 AND destination = $2
       AND is_active = true
       AND (effective_to IS NULL OR effective_to > CURRENT_DATE)
       ORDER BY effective_from DESC
       LIMIT 1`,
      [origin, destination]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async getActiveInsuranceConfig(): Promise<InsuranceConfig | null> {
    const result = await database.query<InsuranceConfig>(
      `SELECT * FROM insurance_config
       WHERE is_active = true
       ORDER BY created_at DESC
       LIMIT 1`
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async calculateFreight(
    weight: number,
    declaredValue: number,
    origin: string,
    destination: string
  ): Promise<FreightCalculation> {
    // Get freight rate
    let rate = await this.getActiveRate(origin, destination);

    if (!rate) {
      // Use default rate
      logger.warn(`No rate found for ${origin} -> ${destination}, using default`);
      rate = {
        rate_per_kg: config.app.defaultFreightRate,
        min_charge: 5000,
      } as FreightRate;
    }

    // Calculate freight
    let freightCharge = weight * rate.rate_per_kg;

    // Apply minimum charge
    if (freightCharge < rate.min_charge) {
      freightCharge = rate.min_charge;
    }

    // Calculate insurance
    let insuranceCharge = 0;
    const insuranceConfig = await this.getActiveInsuranceConfig();

    if (insuranceConfig && declaredValue >= insuranceConfig.min_value) {
      insuranceCharge = declaredValue * insuranceConfig.rate;
      logger.info(`Insurance applied: ${declaredValue} * ${insuranceConfig.rate} = ${insuranceCharge}`);
    }

    const totalCharge = freightCharge + insuranceCharge;

    return {
      weight,
      rate_per_kg: rate.rate_per_kg,
      freight_charge: Math.round(freightCharge),
      insurance_charge: Math.round(insuranceCharge),
      total_charge: Math.round(totalCharge),
    };
  }
}

export default new FreightService();

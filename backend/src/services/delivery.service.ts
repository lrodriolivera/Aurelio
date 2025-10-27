// =========================================
// Delivery Service
// Business Logic for Package Delivery/Pickup
// =========================================

import database from '../config/database';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';
import { Package } from '../types';

interface CreateDeliveryDto {
  package_id: string;
  delivery_type: 'ENTREGA_DOMICILIO' | 'RETIRO_SUCURSAL';
  recipient_name: string;
  recipient_rut?: string;
  recipient_phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_notes?: string;
  signature_data?: string; // Base64 encoded signature
}

interface DeliveryRecord {
  id: string;
  package_id: string;
  package_number: string;
  order_number: string;
  customer_name: string;
  delivery_type: string;
  recipient_name: string;
  recipient_rut?: string;
  delivered_at: Date;
  delivered_by_name?: string;
  status: string;
}

class DeliveryService {
  /**
   * Get packages ready for delivery/pickup
   */
  async getReadyPackages(destination?: string): Promise<any[]> {
    let query = `
      SELECT
        p.id as package_id,
        p.package_number,
        p.description,
        p.weight,
        p.current_status,
        p.current_location,
        o.id as order_id,
        o.order_number,
        o.destination,
        c.business_name as customer_name,
        c.rut as customer_rut,
        c.phone as customer_phone,
        c.email as customer_email
      FROM packages p
      JOIN orders o ON p.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      WHERE p.current_status IN ('EN_BODEGA_DESTINO', 'LISTO_RETIRO')
    `;

    const params: any[] = [];

    if (destination) {
      query += ' AND o.destination = $1';
      params.push(destination);
    }

    query += ' ORDER BY p.created_at';

    const result = await database.query(query, params);
    return result.rows;
  }

  /**
   * Register a delivery or pickup
   */
  async createDelivery(data: CreateDeliveryDto, userId: string): Promise<any> {
    return await database.transaction(async (client) => {
      // Verify package exists and is in correct status
      const packageResult = await client.query<Package>(
        'SELECT * FROM packages WHERE id = $1',
        [data.package_id]
      );

      if (packageResult.rows.length === 0) {
        throw ApiError.notFound('Bulto no encontrado');
      }

      const pkg = packageResult.rows[0];

      if (!['EN_BODEGA_DESTINO', 'LISTO_RETIRO'].includes(pkg.current_status)) {
        throw ApiError.badRequest(
          'El bulto no está disponible para entrega o retiro'
        );
      }

      // Create delivery record
      const deliveryResult = await client.query(
        `INSERT INTO deliveries (
          package_id,
          order_id,
          delivery_type,
          recipient_name,
          recipient_rut,
          recipient_phone,
          delivery_address,
          delivery_city,
          delivery_notes,
          signature_data,
          delivered_at,
          delivered_by,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, 'COMPLETED')
        RETURNING *`,
        [
          data.package_id,
          pkg.order_id,
          data.delivery_type,
          data.recipient_name,
          data.recipient_rut || null,
          data.recipient_phone || null,
          data.delivery_address || null,
          data.delivery_city || null,
          data.delivery_notes || null,
          data.signature_data || null,
          userId,
        ]
      );

      // Update package status to ENTREGADO
      await client.query(
        `UPDATE packages
         SET current_status = 'ENTREGADO',
             updated_at = NOW()
         WHERE id = $1`,
        [data.package_id]
      );

      // Create tracking state
      await client.query(
        `INSERT INTO tracking_states (
          package_id,
          order_id,
          state,
          location,
          description,
          changed_by
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.package_id,
          pkg.order_id,
          'ENTREGADO',
          data.delivery_city || pkg.current_location,
          data.delivery_type === 'ENTREGA_DOMICILIO'
            ? `Entregado a domicilio - ${data.recipient_name}`
            : `Retirado en sucursal - ${data.recipient_name}`,
          userId,
        ]
      );

      // Check if all packages of the order are delivered
      const orderPackagesResult = await client.query(
        `SELECT COUNT(*) as total,
                COUNT(CASE WHEN current_status = 'ENTREGADO' THEN 1 END) as delivered
         FROM packages
         WHERE order_id = $1`,
        [pkg.order_id]
      );

      const { total, delivered } = orderPackagesResult.rows[0];

      // If all packages are delivered, update order status
      if (parseInt(total) === parseInt(delivered)) {
        await client.query(
          `UPDATE orders
           SET status = 'ENTREGADO',
               updated_at = NOW()
           WHERE id = $1`,
          [pkg.order_id]
        );
      }

      logger.info(
        `Package ${pkg.package_number} delivered via ${data.delivery_type} to ${data.recipient_name}`
      );

      return deliveryResult.rows[0];
    });
  }

  /**
   * Get delivery history
   */
  async getDeliveries(params?: {
    page?: number;
    limit?: number;
    delivery_type?: string;
    search?: string;
  }): Promise<any> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;
    const search = params?.search || '';

    let query = `
      SELECT
        d.id,
        d.delivery_type,
        d.recipient_name,
        d.recipient_rut,
        d.recipient_phone,
        d.delivered_at,
        d.status,
        p.package_number,
        o.order_number,
        o.destination,
        c.business_name as customer_name,
        u.first_name || ' ' || u.last_name as delivered_by_name
      FROM deliveries d
      JOIN packages p ON d.package_id = p.id
      JOIN orders o ON d.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON d.delivered_by = u.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Search filter
    if (search) {
      query += ` AND (
        p.package_number ILIKE $${queryParams.length + 1} OR
        o.order_number ILIKE $${queryParams.length + 1} OR
        d.recipient_name ILIKE $${queryParams.length + 1}
      )`;
      queryParams.push(`%${search}%`);
    }

    // Delivery type filter
    if (params?.delivery_type) {
      query += ` AND d.delivery_type = $${queryParams.length + 1}`;
      queryParams.push(params.delivery_type);
    }

    // Count total
    const countQuery = `
      SELECT COUNT(*) as count
      FROM deliveries d
      JOIN packages p ON d.package_id = p.id
      JOIN orders o ON d.order_id = o.id
      WHERE 1=1
      ${search ? `AND (p.package_number ILIKE '%${search}%' OR o.order_number ILIKE '%${search}%' OR d.recipient_name ILIKE '%${search}%')` : ''}
      ${params?.delivery_type ? `AND d.delivery_type = '${params.delivery_type}'` : ''}
    `;
    const countResult = await database.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY d.delivered_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await database.query(query, queryParams);

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

  /**
   * Get delivery by ID
   */
  async getById(id: string): Promise<any> {
    const result = await database.query(
      `SELECT
        d.*,
        p.package_number,
        p.description as package_description,
        p.weight,
        o.order_number,
        o.destination,
        c.business_name as customer_name,
        c.rut as customer_rut,
        c.phone as customer_phone,
        u.first_name || ' ' || u.last_name as delivered_by_name
      FROM deliveries d
      JOIN packages p ON d.package_id = p.id
      JOIN orders o ON d.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON d.delivered_by = u.id
      WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Entrega no encontrada');
    }

    return result.rows[0];
  }

  /**
   * Get delivery statistics
   */
  async getStats(): Promise<{
    total: number;
    today: number;
    by_type: Record<string, number>;
  }> {
    const totalResult = await database.query(
      'SELECT COUNT(*) as total FROM deliveries'
    );
    const total = parseInt(totalResult.rows[0].total);

    const todayResult = await database.query(
      `SELECT COUNT(*) as today
       FROM deliveries
       WHERE DATE(delivered_at) = CURRENT_DATE`
    );
    const today = parseInt(todayResult.rows[0].today);

    const typeResult = await database.query(`
      SELECT delivery_type, COUNT(*) as count
      FROM deliveries
      WHERE DATE(delivered_at) = CURRENT_DATE
      GROUP BY delivery_type
    `);

    const by_type: Record<string, number> = {};
    typeResult.rows.forEach((row) => {
      by_type[row.delivery_type] = parseInt(row.count);
    });

    return { total, today, by_type };
  }
}

export default new DeliveryService();

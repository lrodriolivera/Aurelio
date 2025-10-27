// =========================================
// Order Service
// Business Logic for Order Management
// =========================================

import database from '../config/database';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';
import QRCodeUtils from '../utils/qrcode';
import freightService from './freight.service';
import {
  Order,
  Package,
  CreateOrderDto,
  CreatePackageDto,
  QueryParams,
  PaginatedResponse,
} from '../types';

class OrderService {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<any>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;
    const search = params?.search || '';

    let query = `
      SELECT
        o.*,
        c.business_name as customer_name,
        c.rut as customer_rut,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Search filter
    if (search) {
      query += ` AND (
        o.order_number ILIKE $1 OR
        c.business_name ILIKE $1 OR
        c.rut ILIKE $1
      )`;
      queryParams.push(`%${search}%`);
    }

    // Status filter
    if (params?.filters?.status) {
      query += ` AND o.status = $${queryParams.length + 1}`;
      queryParams.push(params.filters.status);
    }

    // Count total
    const countQuery = query.replace(
      'SELECT o.*, c.business_name as customer_name, c.rut as customer_rut, u.first_name',
      'SELECT COUNT(o.id)'
    );
    const countResult = await database.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY o.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
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

  async getById(id: string): Promise<any> {
    const result = await database.query(
      `SELECT
        o.*,
        c.business_name as customer_name,
        c.rut as customer_rut,
        c.phone as customer_phone,
        c.email as customer_email,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Orden no encontrada');
    }

    const order = result.rows[0];

    // Get packages
    const packagesResult = await database.query<Package>(
      'SELECT * FROM packages WHERE order_id = $1 ORDER BY sequence_number',
      [id]
    );

    return {
      ...order,
      packages: packagesResult.rows,
    };
  }

  async create(data: CreateOrderDto, userId: string): Promise<any> {
    // Validate packages
    if (!data.packages || data.packages.length === 0) {
      throw ApiError.badRequest('Debe incluir al menos un bulto');
    }

    // Calculate total weight
    const totalWeight = data.packages.reduce((sum, pkg) => sum + pkg.weight, 0);

    // Calculate freight and insurance
    const calculation = await freightService.calculateFreight(
      totalWeight,
      data.declared_value,
      data.origin || 'Santiago',
      data.destination
    );

    // Start transaction
    return await database.transaction(async (client) => {
      // Generate order number
      const orderNumberResult = await client.query('SELECT generate_order_number() as order_number');
      const orderNumber = orderNumberResult.rows[0].order_number;

      // Generate QR code for order
      const qrData = `ORDER:${orderNumber}`;
      const qrCode = await QRCodeUtils.generateQRCode(qrData);

      // Create order
      const orderResult = await client.query<Order>(
        `INSERT INTO orders (
          order_number, customer_id, created_by, total_packages, total_weight,
          declared_value, origin, destination, freight_charge, insurance_charge,
          other_charges, total_charge, status, qr_code, notes, special_instructions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          orderNumber,
          data.customer_id,
          userId,
          data.packages.length,
          totalWeight,
          data.declared_value,
          data.origin || 'Santiago',
          data.destination,
          calculation.freight_charge,
          calculation.insurance_charge,
          0,
          calculation.total_charge,
          'RECIBIDO',
          qrCode,
          data.notes || null,
          data.special_instructions || null,
        ]
      );

      const order = orderResult.rows[0];

      // Create packages
      const packages: Package[] = [];
      for (let i = 0; i < data.packages.length; i++) {
        const pkgData = data.packages[i];
        const sequenceNumber = i + 1;

        // Generate package number
        const packageNumberResult = await client.query(
          "SELECT generate_package_number($1, $2) as package_number",
          [orderNumber, sequenceNumber]
        );
        const packageNumber = packageNumberResult.rows[0].package_number;

        // Generate QR for package
        const pkgQrData = `PKG:${packageNumber}`;
        const pkgQrCode = await QRCodeUtils.generateQRCode(pkgQrData);

        // Calculate volume if dimensions provided
        let volume = null;
        if (pkgData.length && pkgData.width && pkgData.height) {
          volume = (pkgData.length * pkgData.width * pkgData.height) / 1000000; // Convert to m³
        }

        const pkgResult = await client.query<Package>(
          `INSERT INTO packages (
            order_id, package_number, sequence_number, description, weight,
            length, width, height, current_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            order.id,
            packageNumber,
            sequenceNumber,
            pkgData.description || null,
            pkgData.weight,
            pkgData.length || null,
            pkgData.width || null,
            pkgData.height || null,
            'RECIBIDO',
          ]
        );

        packages.push(pkgResult.rows[0]);

        // Create initial package status history
        await client.query(
          `INSERT INTO package_status_history (package_id, status, location, notes, changed_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            pkgResult.rows[0].id,
            'RECIBIDO',
            data.origin || 'Santiago',
            'Carga recibida en bodega de origen',
            userId,
          ]
        );
      }

      logger.info(`Order created: ${order.order_number} with ${packages.length} packages`);

      return {
        ...order,
        packages,
      };
    });
  }

  async updateStatus(id: string, status: string, userId: string): Promise<Order> {
    const order = await this.getById(id);

    await database.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    // Update all packages status
    await database.query(
      'UPDATE packages SET current_status = $1, updated_at = NOW() WHERE order_id = $2',
      [status, id]
    );

    logger.info(`Order ${order.order_number} status updated to ${status} by user ${userId}`);

    return this.getById(id);
  }

  async getStats(): Promise<{
    total: number;
    today: number;
    by_status: Record<string, number>;
  }> {
    const totalResult = await database.query('SELECT COUNT(*) as total FROM orders');
    const total = parseInt(totalResult.rows[0].total);

    const todayResult = await database.query(
      "SELECT COUNT(*) as today FROM orders WHERE DATE(created_at) = CURRENT_DATE"
    );
    const today = parseInt(todayResult.rows[0].today);

    const statusResult = await database.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    const by_status: Record<string, number> = {};
    statusResult.rows.forEach((row) => {
      by_status[row.status] = parseInt(row.count);
    });

    return { total, today, by_status };
  }
}

export default new OrderService();

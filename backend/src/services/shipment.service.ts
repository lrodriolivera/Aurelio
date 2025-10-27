// =========================================
// Shipment Service
// Business Logic for Shipment Management
// =========================================

import database from '../config/database';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';
import QRCodeUtils from '../utils/qrcode';
import {
  Shipment,
  Package,
  QueryParams,
  PaginatedResponse,
} from '../types';

interface CreateShipmentDto {
  destination: string;
  carrier?: string;
  vehicle_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  estimated_departure?: Date;
  notes?: string;
}

interface AddOrderToShipmentDto {
  order_id: string;
}

interface ScanPackageDto {
  package_number: string;
  location: string;
}

class ShipmentService {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<any>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;
    const search = params?.search || '';

    let query = `
      SELECT
        s.id,
        s.shipment_number,
        s.destination,
        s.carrier,
        s.vehicle_plate,
        s.driver_name,
        s.driver_phone,
        s.status,
        s.total_packages,
        s.scanned_packages,
        s.total_weight,
        s.estimated_departure,
        s.actual_departure,
        s.estimated_arrival,
        s.actual_arrival,
        s.notes,
        s.created_by,
        s.created_at,
        s.updated_at,
        COUNT(DISTINCT o.id) as total_orders,
        CASE
          WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL
          THEN u.first_name || ' ' || u.last_name
          ELSE NULL
        END as created_by_name
      FROM shipments s
      LEFT JOIN shipment_packages sp ON s.id = sp.shipment_id
      LEFT JOIN packages p ON sp.package_id = p.id
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Search filter
    if (search) {
      query += ` AND (
        s.shipment_number ILIKE $1 OR
        s.destination ILIKE $1
      )`;
      queryParams.push(`%${search}%`);
    }

    // Status filter
    if (params?.filters?.status) {
      query += ` AND s.status = $${queryParams.length + 1}`;
      queryParams.push(params.filters.status);
    }

    // Add GROUP BY with all non-aggregated columns
    query += ` GROUP BY s.id, s.shipment_number, s.destination, s.carrier, s.vehicle_plate,
               s.driver_name, s.driver_phone, s.status, s.total_packages, s.scanned_packages,
               s.total_weight, s.estimated_departure, s.actual_departure, s.estimated_arrival,
               s.actual_arrival, s.notes, s.created_by, s.created_at, s.updated_at, u.first_name, u.last_name`;

    // Count total
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as count
      FROM shipments s
      WHERE 1=1
      ${search ? `AND (s.shipment_number ILIKE $1 OR s.destination ILIKE $1)` : ''}
      ${params?.filters?.status ? `AND s.status = $${queryParams.length}` : ''}
    `;
    const countResult = await database.query(countQuery, search ? [`%${search}%`] : []);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY s.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
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
    try {
      // First get the shipment
      const result = await database.query(
        `SELECT * FROM shipments WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw ApiError.notFound(`Envío no encontrado con ID: ${id}`);
      }

      const shipment = result.rows[0];

      // Get created_by name separately if needed
      let created_by_name = null;
      if (shipment.created_by) {
        try {
          const userResult = await database.query(
            `SELECT first_name, last_name FROM users WHERE id = $1`,
            [shipment.created_by]
          );
          if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            created_by_name = `${user.first_name} ${user.last_name}`;
          }
        } catch (error) {
          logger.warn(`Could not fetch user for shipment ${id}: ${error}`);
          // Continue without user name
        }
      }

    // Get packages in shipment grouped by order
    const packagesResult = await database.query(
      `SELECT
        p.id,
        p.package_number,
        p.description,
        p.weight,
        p.length,
        p.width,
        p.height,
        p.current_status,
        p.label_printed,
        p.label_printed_at,
        p.created_at,
        o.id as order_id,
        o.order_number,
        o.total_weight as order_total_weight,
        o.total_charge,
        c.business_name as customer_name,
        c.rut as customer_rut,
        sp.scanned_at as added_at
      FROM shipment_packages sp
      LEFT JOIN packages p ON sp.package_id = p.id
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE sp.shipment_id = $1
      ORDER BY COALESCE(o.order_number, ''), p.package_number`,
      [id]
    );

    // Group packages by order
    const ordersMap = new Map();
    const orphanPackages: any[] = [];

    packagesResult.rows.forEach((pkg) => {
      // If package has no order, add to orphan packages list
      if (!pkg.order_id) {
        orphanPackages.push({
          id: pkg.id,
          package_number: pkg.package_number,
          description: pkg.description,
          weight: pkg.weight,
          label_printed: pkg.label_printed,
          current_status: pkg.current_status,
        });
        return;
      }

      if (!ordersMap.has(pkg.order_id)) {
        ordersMap.set(pkg.order_id, {
          id: pkg.order_id,
          order_number: pkg.order_number,
          customer_name: pkg.customer_name,
          customer_rut: pkg.customer_rut,
          total_weight: pkg.order_total_weight,
          total_charge: pkg.total_charge,
          added_at: pkg.added_at,
          packages: [],
        });
      }
      ordersMap.get(pkg.order_id).packages.push({
        id: pkg.id,
        package_number: pkg.package_number,
        description: pkg.description,
        weight: pkg.weight,
        label_printed: pkg.label_printed,
        current_status: pkg.current_status,
      });
    });

      const response: any = {
        ...shipment,
        created_by_name,
        orders: Array.from(ordersMap.values()),
      };

      // Include orphan packages if any
      if (orphanPackages.length > 0) {
        response.orphan_packages = orphanPackages;
      }

      return response;
    } catch (error) {
      logger.error(`Error in getById for shipment ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateShipmentDto, userId: string): Promise<any> {
    return await database.transaction(async (client) => {
      // Generate shipment number
      const shipmentNumberResult = await client.query(
        'SELECT generate_shipment_number() as shipment_number'
      );
      const shipmentNumber = shipmentNumberResult.rows[0].shipment_number;

      // Create shipment
      const shipmentResult = await client.query<Shipment>(
        `INSERT INTO shipments (
          shipment_number, destination, carrier, vehicle_plate,
          driver_name, driver_phone, estimated_departure,
          status, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          shipmentNumber,
          data.destination,
          data.carrier || null,
          data.vehicle_plate || null,
          data.driver_name || null,
          data.driver_phone || null,
          data.estimated_departure || null,
          'PLANNING',
          data.notes || null,
          userId,
        ]
      );

      logger.info(`Shipment created: ${shipmentNumber} by user ${userId}`);

      return shipmentResult.rows[0];
    });
  }

  async addOrder(shipmentId: string, data: AddOrderToShipmentDto, userId: string): Promise<any> {
    return await database.transaction(async (client) => {
      // Verify shipment exists and is in PLANNING status
      const shipmentResult = await client.query(
        'SELECT * FROM shipments WHERE id = $1',
        [shipmentId]
      );

      if (shipmentResult.rows.length === 0) {
        throw ApiError.notFound('Envío no encontrado');
      }

      const shipment = shipmentResult.rows[0];

      if (shipment.status !== 'PLANNING') {
        throw ApiError.badRequest('Solo se pueden agregar órdenes a envíos en estado PLANNING');
      }

      // Verify order exists
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE id = $1',
        [data.order_id]
      );

      if (orderResult.rows.length === 0) {
        throw ApiError.notFound('Orden no encontrada');
      }

      const order = orderResult.rows[0];

      // Verify order destination matches shipment destination
      if (order.destination !== shipment.destination) {
        throw ApiError.badRequest(
          `La orden tiene destino ${order.destination} pero el envío es para ${shipment.destination}`
        );
      }

      // Get all packages for this order
      const packagesResult = await client.query<Package>(
        'SELECT * FROM packages WHERE order_id = $1',
        [data.order_id]
      );

      if (packagesResult.rows.length === 0) {
        throw ApiError.badRequest('La orden no tiene bultos');
      }

      // Check if any package is already in this shipment
      const existingResult = await client.query(
        `SELECT COUNT(*) as count
         FROM shipment_packages
         WHERE shipment_id = $1 AND package_id = ANY($2)`,
        [shipmentId, packagesResult.rows.map((p) => p.id)]
      );

      if (parseInt(existingResult.rows[0].count) > 0) {
        throw ApiError.conflict('Algunos bultos de esta orden ya están en este envío');
      }

      // Add all packages to shipment
      for (const pkg of packagesResult.rows) {
        await client.query(
          `INSERT INTO shipment_packages (shipment_id, package_id, scanned_at, scanned_by)
           VALUES ($1, $2, NOW(), $3)`,
          [shipmentId, pkg.id, userId]
        );
      }

      logger.info(`Order ${order.order_number} (${packagesResult.rows.length} packages) added to shipment ${shipment.shipment_number}`);

      return this.getById(shipmentId);
    });
  }

  async removeOrder(shipmentId: string, orderId: string): Promise<any> {
    return await database.transaction(async (client) => {
      // Verify shipment is in PLANNING status
      const shipmentResult = await client.query(
        'SELECT * FROM shipments WHERE id = $1',
        [shipmentId]
      );

      if (shipmentResult.rows.length === 0) {
        throw ApiError.notFound('Envío no encontrado');
      }

      if (shipmentResult.rows[0].status !== 'PLANNING') {
        throw ApiError.badRequest('Solo se pueden quitar órdenes de envíos en estado PLANNING');
      }

      // Remove all packages of this order from shipment
      const deleteResult = await client.query(
        `DELETE FROM shipment_packages
         WHERE shipment_id = $1
         AND package_id IN (
           SELECT id FROM packages WHERE order_id = $2
         )`,
        [shipmentId, orderId]
      );

      logger.info(`Removed ${deleteResult.rowCount} packages from order ${orderId} from shipment ${shipmentId}`);

      return this.getById(shipmentId);
    });
  }

  async scanPackage(shipmentId: string, data: ScanPackageDto, userId: string): Promise<any> {
    return await database.transaction(async (client) => {
      // Verify shipment exists
      const shipmentResult = await client.query(
        'SELECT * FROM shipments WHERE id = $1',
        [shipmentId]
      );

      if (shipmentResult.rows.length === 0) {
        throw ApiError.notFound('Envío no encontrado');
      }

      // Find package by package_number
      const packageResult = await client.query<Package>(
        'SELECT * FROM packages WHERE package_number = $1',
        [data.package_number]
      );

      if (packageResult.rows.length === 0) {
        throw ApiError.notFound('Bulto no encontrado');
      }

      const pkg = packageResult.rows[0];

      // Verify package is in this shipment
      const packageInShipmentResult = await client.query(
        'SELECT * FROM shipment_packages WHERE shipment_id = $1 AND package_id = $2',
        [shipmentId, pkg.id]
      );

      if (packageInShipmentResult.rows.length === 0) {
        throw ApiError.badRequest('Este bulto no pertenece a este envío');
      }

      // Update package as scanned
      await client.query(
        `UPDATE packages
         SET label_printed = true,
             label_printed_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [pkg.id]
      );

      // Create package status history
      await client.query(
        `INSERT INTO package_status_history (package_id, status, location, notes, changed_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          pkg.id,
          'EN_BODEGA_ORIGEN',
          data.location,
          'Bulto escaneado y agregado al envío',
          userId,
        ]
      );

      // Create package scan record
      await client.query(
        `INSERT INTO package_scans (package_id, shipment_id, scan_type, location, scanned_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          pkg.id,
          shipmentId,
          'LOAD',
          data.location,
          userId,
          'Bulto escaneado para carga en envío',
        ]
      );

      logger.info(`Package ${data.package_number} scanned for shipment ${shipmentResult.rows[0].shipment_number}`);

      return {
        success: true,
        package: pkg,
        message: 'Bulto escaneado exitosamente',
      };
    });
  }

  async dispatch(shipmentId: string, userId: string): Promise<any> {
    const shipment = await this.getById(shipmentId);

    if (shipment.status !== 'PLANNING') {
      throw ApiError.badRequest('Solo se pueden despachar envíos en estado PLANNING');
    }

    // Verify shipment has orders
    if (!shipment.orders || shipment.orders.length === 0) {
      throw ApiError.badRequest('El envío no tiene órdenes asignadas');
    }

    return await database.transaction(async (client) => {
      // Update shipment status
      await client.query(
        `UPDATE shipments
         SET status = 'DISPATCHED',
             actual_departure = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [shipmentId]
      );

      // Update all orders and packages in shipment
      for (const order of shipment.orders) {
        // Update order status
        await client.query(
          `UPDATE orders SET status = 'EN_TRANSITO_PUERTO', updated_at = NOW() WHERE id = $1`,
          [order.id]
        );

        // Update packages status
        await client.query(
          `UPDATE packages SET current_status = 'EN_TRANSITO_PUERTO', updated_at = NOW() WHERE order_id = $1`,
          [order.id]
        );

        // Create package status history for all packages
        for (const pkg of order.packages) {
          await client.query(
            `INSERT INTO package_status_history (package_id, status, location, notes, changed_by)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              pkg.id,
              'EN_TRANSITO_PUERTO',
              shipment.destination,
              `En tránsito hacia ${shipment.destination}`,
              userId,
            ]
          );
        }
      }

      logger.info(`Shipment ${shipment.shipment_number} dispatched by user ${userId}`);

      return this.getById(shipmentId);
    });
  }

  async getStats(): Promise<{
    total: number;
    today: number;
    by_status: Record<string, number>;
  }> {
    const totalResult = await database.query('SELECT COUNT(*) as total FROM shipments');
    const total = parseInt(totalResult.rows[0].total);

    const todayResult = await database.query(
      "SELECT COUNT(*) as today FROM shipments WHERE DATE(created_at) = CURRENT_DATE"
    );
    const today = parseInt(todayResult.rows[0].today);

    const statusResult = await database.query(`
      SELECT status, COUNT(*) as count
      FROM shipments
      GROUP BY status
    `);

    const by_status: Record<string, number> = {};
    statusResult.rows.forEach((row) => {
      by_status[row.status] = parseInt(row.count);
    });

    return { total, today, by_status };
  }
}

export default new ShipmentService();

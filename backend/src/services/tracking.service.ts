// =========================================
// Tracking Service
// Business Logic for Package/Order Tracking
// =========================================

import database from '../config/database';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

interface TrackingState {
  id: string;
  status: string;
  location: string;
  notes: string;
  created_at: Date;
  changed_by_name?: string;
}

interface PackageTracking {
  package_id: string;
  package_number: string;
  sequence_number: number;
  description: string;
  weight: number;
  current_status: string;
  label_printed: boolean;
  states: TrackingState[];
}

interface OrderTracking {
  order_id: string;
  order_number: string;
  created_at: Date;
  status: string;
  origin: string;
  destination: string;
  total_packages: number;
  total_weight: number;
  customer_name: string;
  customer_rut: string;
  customer_phone?: string;
  packages: PackageTracking[];
}

class TrackingService {
  /**
   * Track by order number
   */
  async trackByOrderNumber(orderNumber: string): Promise<OrderTracking> {
    // Get order information
    const orderResult = await database.query(
      `SELECT
        o.id as order_id,
        o.order_number,
        o.created_at,
        o.status,
        o.origin,
        o.destination,
        o.total_packages,
        o.total_weight,
        c.business_name as customer_name,
        c.rut as customer_rut,
        c.phone as customer_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.order_number = $1`,
      [orderNumber]
    );

    if (orderResult.rows.length === 0) {
      throw ApiError.notFound('Orden no encontrada');
    }

    const order = orderResult.rows[0];

    // Get packages for this order
    const packagesResult = await database.query(
      `SELECT
        id as package_id,
        package_number,
        sequence_number,
        description,
        weight,
        current_status,
        label_printed
      FROM packages
      WHERE order_id = $1
      ORDER BY sequence_number`,
      [order.order_id]
    );

    // Get tracking states for each package
    const packages: PackageTracking[] = await Promise.all(
      packagesResult.rows.map(async (pkg) => {
        const statesResult = await database.query(
          `SELECT
            psh.id,
            psh.status,
            psh.location,
            psh.notes,
            psh.created_at,
            u.first_name || ' ' || u.last_name as changed_by_name
          FROM package_status_history psh
          LEFT JOIN users u ON psh.changed_by = u.id
          WHERE psh.package_id = $1
          ORDER BY psh.created_at DESC`,
          [pkg.package_id]
        );

        return {
          ...pkg,
          states: statesResult.rows,
        };
      })
    );

    logger.info(`Tracking query for order: ${orderNumber}`);

    return {
      ...order,
      packages,
    };
  }

  /**
   * Track by package number
   */
  async trackByPackageNumber(packageNumber: string): Promise<{
    package: PackageTracking;
    order: OrderTracking;
  }> {
    // Get package information
    const packageResult = await database.query(
      `SELECT
        p.id as package_id,
        p.package_number,
        p.sequence_number,
        p.description,
        p.weight,
        p.current_status,
        p.label_printed,
        p.order_id
      FROM packages p
      WHERE p.package_number = $1`,
      [packageNumber]
    );

    if (packageResult.rows.length === 0) {
      throw ApiError.notFound('Bulto no encontrado');
    }

    const pkg = packageResult.rows[0];

    // Get tracking states for this package
    const statesResult = await database.query(
      `SELECT
        psh.id,
        psh.status,
        psh.location,
        psh.notes,
        psh.created_at,
        u.first_name || ' ' || u.last_name as changed_by_name
      FROM package_status_history psh
      LEFT JOIN users u ON psh.changed_by = u.id
      WHERE psh.package_id = $1
      ORDER BY psh.created_at DESC`,
      [pkg.package_id]
    );

    const packageTracking: PackageTracking = {
      ...pkg,
      states: statesResult.rows,
    };

    // Get order information
    const orderResult = await database.query(
      `SELECT
        o.id as order_id,
        o.order_number,
        o.created_at,
        o.status,
        o.origin,
        o.destination,
        o.total_packages,
        o.total_weight,
        c.business_name as customer_name,
        c.rut as customer_rut,
        c.phone as customer_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1`,
      [pkg.order_id]
    );

    if (orderResult.rows.length === 0) {
      throw ApiError.notFound('Orden no encontrada');
    }

    const order = orderResult.rows[0];

    // Get all packages for the order
    const allPackagesResult = await database.query(
      `SELECT
        id as package_id,
        package_number,
        sequence_number,
        description,
        weight,
        current_status,
        label_printed
      FROM packages
      WHERE order_id = $1
      ORDER BY sequence_number`,
      [pkg.order_id]
    );

    const packages: PackageTracking[] = await Promise.all(
      allPackagesResult.rows.map(async (p) => {
        const states = await database.query(
          `SELECT
            psh.id,
            psh.status,
            psh.location,
            psh.notes,
            psh.created_at,
            u.first_name || ' ' || u.last_name as changed_by_name
          FROM package_status_history psh
          LEFT JOIN users u ON psh.changed_by = u.id
          WHERE psh.package_id = $1
          ORDER BY psh.created_at DESC`,
          [p.package_id]
        );

        return {
          ...p,
          states: states.rows,
        };
      })
    );

    logger.info(`Tracking query for package: ${packageNumber}`);

    return {
      package: packageTracking,
      order: {
        ...order,
        packages,
      },
    };
  }

  /**
   * Get recent tracking events
   */
  async getRecentEvents(limit: number = 50): Promise<any[]> {
    const result = await database.query(
      `SELECT
        psh.id,
        psh.status,
        psh.location,
        psh.notes,
        psh.created_at,
        p.package_number,
        o.order_number,
        c.business_name as customer_name,
        u.first_name || ' ' || u.last_name as changed_by_name
      FROM package_status_history psh
      JOIN packages p ON psh.package_id = p.id
      JOIN orders o ON p.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON psh.changed_by = u.id
      ORDER BY psh.created_at DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  /**
   * Get tracking statistics
   */
  async getStats(): Promise<{
    total_events: number;
    today_events: number;
    by_state: Record<string, number>;
  }> {
    const totalResult = await database.query(
      'SELECT COUNT(*) as total FROM package_status_history'
    );
    const total_events = parseInt(totalResult.rows[0].total);

    const todayResult = await database.query(
      `SELECT COUNT(*) as today
       FROM package_status_history
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    const today_events = parseInt(todayResult.rows[0].today);

    const stateResult = await database.query(`
      SELECT status, COUNT(*) as count
      FROM package_status_history
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY status
    `);

    const by_state: Record<string, number> = {};
    stateResult.rows.forEach((row) => {
      by_state[row.status] = parseInt(row.count);
    });

    return { total_events, today_events, by_state };
  }
}

export default new TrackingService();

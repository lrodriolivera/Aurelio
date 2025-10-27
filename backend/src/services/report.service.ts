// =========================================
// Report Service
// Business Logic for Reports and Analytics
// =========================================

import database from '../config/database';
import logger from '../utils/logger';

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface OrdersReport {
  total_orders: number;
  total_packages: number;
  total_weight: number;
  total_revenue: number;
  by_status: {
    status: string;
    count: number;
    percentage: number;
  }[];
  by_destination: {
    destination: string;
    count: number;
    total_packages: number;
    total_weight: number;
  }[];
  by_customer: {
    customer_name: string;
    customer_rut: string;
    order_count: number;
    package_count: number;
    total_weight: number;
    total_revenue: number;
  }[];
}

export interface ShipmentsReport {
  total_shipments: number;
  total_packages: number;
  total_weight: number;
  by_status: {
    status: string;
    count: number;
    percentage: number;
  }[];
  by_route: {
    origin: string;
    destination: string;
    shipment_count: number;
    package_count: number;
  }[];
}

export interface DeliveriesReport {
  total_deliveries: number;
  by_type: {
    delivery_type: string;
    count: number;
    percentage: number;
  }[];
  by_destination: {
    destination: string;
    delivery_count: number;
  }[];
}

export interface GeneralStats {
  orders: {
    total: number;
    today: number;
    this_week: number;
    this_month: number;
  };
  packages: {
    total: number;
    in_transit: number;
    delivered: number;
  };
  shipments: {
    total: number;
    active: number;
    completed: number;
  };
  deliveries: {
    total: number;
    today: number;
    this_week: number;
  };
}

class ReportService {
  /**
   * Get orders report for a date range
   */
  async getOrdersReport(params: DateRangeParams): Promise<OrdersReport> {
    const { start_date, end_date } = params;

    // Build date filter
    let dateFilter = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (start_date) {
      dateFilter += ` AND o.created_at >= $${paramIndex}::date`;
      queryParams.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      dateFilter += ` AND o.created_at <= $${paramIndex}::date`;
      queryParams.push(end_date);
      paramIndex++;
    }

    // Get totals
    const totalsResult = await database.query(
      `SELECT
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(p.id) as total_packages,
        COALESCE(SUM(p.weight), 0) as total_weight,
        COALESCE(SUM(o.total_charge), 0) as total_revenue
       FROM orders o
       LEFT JOIN packages p ON o.id = p.order_id
       WHERE 1=1 ${dateFilter}`,
      queryParams
    );

    const totals = totalsResult.rows[0];

    // By status
    const statusResult = await database.query(
      `SELECT
        o.status,
        COUNT(*) as count
       FROM orders o
       WHERE 1=1 ${dateFilter}
       GROUP BY o.status
       ORDER BY count DESC`,
      queryParams
    );

    const totalOrders = parseInt(totals.total_orders);
    const by_status = statusResult.rows.map((row) => ({
      status: row.status,
      count: parseInt(row.count),
      percentage: totalOrders > 0 ? (parseInt(row.count) / totalOrders) * 100 : 0,
    }));

    // By destination
    const destinationResult = await database.query(
      `SELECT
        o.destination,
        COUNT(DISTINCT o.id) as count,
        COUNT(p.id) as total_packages,
        COALESCE(SUM(p.weight), 0) as total_weight
       FROM orders o
       LEFT JOIN packages p ON o.id = p.order_id
       WHERE 1=1 ${dateFilter}
       GROUP BY o.destination
       ORDER BY count DESC`,
      queryParams
    );

    const by_destination = destinationResult.rows.map((row) => ({
      destination: row.destination,
      count: parseInt(row.count),
      total_packages: parseInt(row.total_packages),
      total_weight: parseFloat(row.total_weight),
    }));

    // By customer
    const customerResult = await database.query(
      `SELECT
        c.business_name as customer_name,
        c.rut as customer_rut,
        COUNT(DISTINCT o.id) as order_count,
        COUNT(p.id) as package_count,
        COALESCE(SUM(p.weight), 0) as total_weight,
        COALESCE(SUM(o.total_charge), 0) as total_revenue
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       LEFT JOIN packages p ON o.id = p.order_id
       WHERE 1=1 ${dateFilter}
       GROUP BY c.id, c.business_name, c.rut
       ORDER BY order_count DESC
       LIMIT 10`,
      queryParams
    );

    const by_customer = customerResult.rows.map((row) => ({
      customer_name: row.customer_name,
      customer_rut: row.customer_rut,
      order_count: parseInt(row.order_count),
      package_count: parseInt(row.package_count),
      total_weight: parseFloat(row.total_weight),
      total_revenue: parseFloat(row.total_revenue),
    }));

    return {
      total_orders: totalOrders,
      total_packages: parseInt(totals.total_packages),
      total_weight: parseFloat(totals.total_weight),
      total_revenue: parseFloat(totals.total_revenue),
      by_status,
      by_destination,
      by_customer,
    };
  }

  /**
   * Get shipments report for a date range
   */
  async getShipmentsReport(params: DateRangeParams): Promise<ShipmentsReport> {
    const { start_date, end_date } = params;

    // Build date filter
    let dateFilter = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (start_date) {
      dateFilter += ` AND s.created_at >= $${paramIndex}::date`;
      queryParams.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      dateFilter += ` AND s.created_at <= $${paramIndex}::date`;
      queryParams.push(end_date);
      paramIndex++;
    }

    // Get totals
    const totalsResult = await database.query(
      `SELECT
        COUNT(DISTINCT s.id) as total_shipments,
        COUNT(DISTINCT sp.package_id) as total_packages,
        COALESCE(SUM(p.weight), 0) as total_weight
       FROM shipments s
       LEFT JOIN shipment_packages sp ON s.id = sp.shipment_id
       LEFT JOIN packages p ON sp.package_id = p.id
       WHERE 1=1 ${dateFilter}`,
      queryParams
    );

    const totals = totalsResult.rows[0];

    // By status
    const statusResult = await database.query(
      `SELECT
        s.status,
        COUNT(*) as count
       FROM shipments s
       WHERE 1=1 ${dateFilter}
       GROUP BY s.status
       ORDER BY count DESC`,
      queryParams
    );

    const totalShipments = parseInt(totals.total_shipments);
    const by_status = statusResult.rows.map((row) => ({
      status: row.status,
      count: parseInt(row.count),
      percentage: totalShipments > 0 ? (parseInt(row.count) / totalShipments) * 100 : 0,
    }));

    // By route
    const routeResult = await database.query(
      `SELECT
        s.origin,
        s.destination,
        COUNT(DISTINCT s.id) as shipment_count,
        COUNT(DISTINCT sp.package_id) as package_count
       FROM shipments s
       LEFT JOIN shipment_packages sp ON s.id = sp.shipment_id
       WHERE 1=1 ${dateFilter}
       GROUP BY s.origin, s.destination
       ORDER BY shipment_count DESC`,
      queryParams
    );

    const by_route = routeResult.rows.map((row) => ({
      origin: row.origin,
      destination: row.destination,
      shipment_count: parseInt(row.shipment_count),
      package_count: parseInt(row.package_count),
    }));

    return {
      total_shipments: totalShipments,
      total_packages: parseInt(totals.total_packages),
      total_weight: parseFloat(totals.total_weight),
      by_status,
      by_route,
    };
  }

  /**
   * Get deliveries report for a date range
   */
  async getDeliveriesReport(params: DateRangeParams): Promise<DeliveriesReport> {
    const { start_date, end_date } = params;

    // Build date filter
    let dateFilter = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (start_date) {
      dateFilter += ` AND d.delivered_at >= $${paramIndex}::date`;
      queryParams.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      dateFilter += ` AND d.delivered_at <= $${paramIndex}::date`;
      queryParams.push(end_date);
      paramIndex++;
    }

    // Get totals
    const totalsResult = await database.query(
      `SELECT COUNT(*) as total_deliveries FROM deliveries d WHERE 1=1 ${dateFilter}`,
      queryParams
    );

    const total_deliveries = parseInt(totalsResult.rows[0].total_deliveries);

    // By type
    const typeResult = await database.query(
      `SELECT
        d.delivery_type,
        COUNT(*) as count
       FROM deliveries d
       WHERE 1=1 ${dateFilter}
       GROUP BY d.delivery_type
       ORDER BY count DESC`,
      queryParams
    );

    const by_type = typeResult.rows.map((row) => ({
      delivery_type: row.delivery_type,
      count: parseInt(row.count),
      percentage: total_deliveries > 0 ? (parseInt(row.count) / total_deliveries) * 100 : 0,
    }));

    // By destination
    const destinationResult = await database.query(
      `SELECT
        o.destination,
        COUNT(*) as delivery_count
       FROM deliveries d
       JOIN orders o ON d.order_id = o.id
       WHERE 1=1 ${dateFilter}
       GROUP BY o.destination
       ORDER BY delivery_count DESC`,
      queryParams
    );

    const by_destination = destinationResult.rows.map((row) => ({
      destination: row.destination,
      delivery_count: parseInt(row.delivery_count),
    }));

    return {
      total_deliveries,
      by_type,
      by_destination,
    };
  }

  /**
   * Get general statistics
   */
  async getGeneralStats(): Promise<GeneralStats> {
    // Orders stats
    const ordersResult = await database.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as this_month
      FROM orders
    `);

    // Packages stats
    const packagesResult = await database.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN current_status IN ('EN_TRANSITO_PUERTO', 'EN_TRANSITO_DESTINO', 'EN_BODEGA_PUERTO', 'EN_BODEGA_DESTINO') THEN 1 END) as in_transit,
        COUNT(CASE WHEN current_status = 'ENTREGADO' THEN 1 END) as delivered
      FROM packages
    `);

    // Shipments stats
    const shipmentsResult = await database.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('PLANNING', 'DISPATCHED', 'IN_TRANSIT') THEN 1 END) as active,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as completed
      FROM shipments
    `);

    // Deliveries stats
    const deliveriesResult = await database.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN DATE(delivered_at) = CURRENT_DATE THEN 1 END) as today,
        COUNT(CASE WHEN delivered_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week
      FROM deliveries
    `);

    return {
      orders: {
        total: parseInt(ordersResult.rows[0].total),
        today: parseInt(ordersResult.rows[0].today),
        this_week: parseInt(ordersResult.rows[0].this_week),
        this_month: parseInt(ordersResult.rows[0].this_month),
      },
      packages: {
        total: parseInt(packagesResult.rows[0].total),
        in_transit: parseInt(packagesResult.rows[0].in_transit),
        delivered: parseInt(packagesResult.rows[0].delivered),
      },
      shipments: {
        total: parseInt(shipmentsResult.rows[0].total),
        active: parseInt(shipmentsResult.rows[0].active),
        completed: parseInt(shipmentsResult.rows[0].completed),
      },
      deliveries: {
        total: parseInt(deliveriesResult.rows[0].total),
        today: parseInt(deliveriesResult.rows[0].today),
        this_week: parseInt(deliveriesResult.rows[0].this_week),
      },
    };
  }
}

export default new ReportService();

// =========================================
// Reports API Service
// Client for Report Endpoints
// =========================================

import { api } from './api';

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export const reportsApi = {
  /**
   * Get general statistics
   */
  async getGeneralStats() {
    const response = await api.get('/reports/stats');
    return response.data;
  },

  /**
   * Get orders report
   */
  async getOrdersReport(params: DateRangeParams) {
    const response = await api.get('/reports/orders', { params });
    return response.data;
  },

  /**
   * Get shipments report
   */
  async getShipmentsReport(params: DateRangeParams) {
    const response = await api.get('/reports/shipments', { params });
    return response.data;
  },

  /**
   * Get deliveries report
   */
  async getDeliveriesReport(params: DateRangeParams) {
    const response = await api.get('/reports/deliveries', { params });
    return response.data;
  },
};

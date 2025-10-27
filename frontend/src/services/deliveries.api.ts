// =========================================
// Deliveries API Service
// Client for Delivery Endpoints
// =========================================

import { api } from './api';

export interface CreateDeliveryDto {
  package_id: string;
  delivery_type: 'ENTREGA_DOMICILIO' | 'RETIRO_SUCURSAL';
  recipient_name: string;
  recipient_rut?: string;
  recipient_phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_notes?: string;
  signature_data?: string;
}

export const deliveriesApi = {
  /**
   * Get packages ready for delivery/pickup
   */
  async getReadyPackages(destination?: string) {
    const response = await api.get('/deliveries/ready', {
      params: { destination },
    });
    return response.data;
  },

  /**
   * Get delivery history
   */
  async getAll(params: {
    page?: number;
    limit?: number;
    delivery_type?: string;
    search?: string;
  }) {
    const response = await api.get('/deliveries', { params });
    return response.data;
  },

  /**
   * Get delivery by ID
   */
  async getById(id: string) {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },

  /**
   * Register a delivery
   */
  async create(data: CreateDeliveryDto) {
    const response = await api.post('/deliveries', data);
    return response.data;
  },

  /**
   * Get delivery statistics
   */
  async getStats() {
    const response = await api.get('/deliveries/stats');
    return response.data;
  },
};

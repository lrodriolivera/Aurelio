// =========================================
// Tracking API Service
// Client for Tracking Endpoints
// =========================================

import { api } from './api';

export interface TrackingState {
  id: string;
  state: string;
  location: string;
  description: string;
  changed_at: string;
  changed_by_name?: string;
}

export interface PackageTracking {
  package_id: string;
  package_number: string;
  sequence_number: number;
  description: string;
  weight: number;
  current_status: string;
  current_location: string;
  label_printed: boolean;
  states: TrackingState[];
}

export interface OrderTracking {
  order_id: string;
  order_number: string;
  created_at: string;
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

export interface TrackingResponse {
  order?: OrderTracking;
  package?: PackageTracking;
}

export interface TrackingEvent {
  id: string;
  state: string;
  location: string;
  description: string;
  changed_at: string;
  package_number: string;
  order_number: string;
  customer_name: string;
  changed_by_name?: string;
}

export const trackingApi = {
  /**
   * Track by tracking number (auto-detect order or package)
   */
  async track(trackingNumber: string) {
    const response = await api.get(`/tracking/track/${trackingNumber}`);
    return response.data;
  },

  /**
   * Track by order number
   */
  async trackByOrder(orderNumber: string) {
    const response = await api.get(`/tracking/order/${orderNumber}`);
    return response.data;
  },

  /**
   * Track by package number
   */
  async trackByPackage(packageNumber: string) {
    const response = await api.get(`/tracking/package/${packageNumber}`);
    return response.data;
  },

  /**
   * Get recent tracking events (authenticated)
   */
  async getRecentEvents(limit: number = 50) {
    const response = await api.get(`/tracking/events`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get tracking statistics (authenticated)
   */
  async getStats() {
    const response = await api.get('/tracking/stats');
    return response.data;
  },
};

// =========================================
// Shipments API Service
// =========================================

import { api } from './api';
import { Order } from './orders.api';

export interface Shipment {
  id: string;
  shipment_number: string;
  destination: string;
  carrier?: string;
  vehicle_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  estimated_departure?: string;
  actual_departure?: string;
  status: string;
  qr_code?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_packages?: number;
  scanned_packages?: number;
  total_weight?: string;
  created_by_name?: string;
  orders?: Order[];
}

export interface CreateShipmentDto {
  destination: string;
  carrier?: string;
  vehicle_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  estimated_departure?: string;
  notes?: string;
}

export interface ShipmentStats {
  total: number;
  today: number;
  by_status: Record<string, number>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const shipmentsApi = {
  // Get all shipments with pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Shipment>> => {
    const response = await api.get('/shipments', { params });
    return response.data;
  },

  // Get shipment by ID with orders
  getById: async (id: string): Promise<{ success: boolean; data: Shipment }> => {
    const response = await api.get(`/shipments/${id}`);
    return response.data;
  },

  // Create new shipment
  create: async (data: CreateShipmentDto): Promise<{ success: boolean; data: Shipment; message: string }> => {
    const response = await api.post('/shipments', data);
    return response.data;
  },

  // Add order to shipment
  addOrder: async (shipmentId: string, orderId: string): Promise<{ success: boolean; data: Shipment; message: string }> => {
    const response = await api.post(`/shipments/${shipmentId}/orders`, { order_id: orderId });
    return response.data;
  },

  // Remove order from shipment
  removeOrder: async (shipmentId: string, orderId: string): Promise<{ success: boolean; data: Shipment; message: string }> => {
    const response = await api.delete(`/shipments/${shipmentId}/orders/${orderId}`);
    return response.data;
  },

  // Scan package for shipment
  scanPackage: async (shipmentId: string, packageNumber: string, location: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/shipments/${shipmentId}/scan`, {
      package_number: packageNumber,
      location,
    });
    return response.data;
  },

  // Dispatch shipment
  dispatch: async (shipmentId: string): Promise<{ success: boolean; data: Shipment; message: string }> => {
    const response = await api.put(`/shipments/${shipmentId}/dispatch`);
    return response.data;
  },

  // Get shipment statistics
  getStats: async (): Promise<{ success: boolean; data: ShipmentStats }> => {
    const response = await api.get('/shipments/stats');
    return response.data;
  },
};

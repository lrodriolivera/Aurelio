// =========================================
// Orders API Service
// =========================================

import { api } from './api';

export interface Package {
  id?: string;
  order_id?: string;
  package_number?: string;
  sequence_number?: number;
  description?: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  volume?: number;
  qr_code?: string;
  barcode?: string;
  current_status?: string;
  current_location?: string;
  label_printed?: boolean;
  label_printed_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  created_by: string;
  total_packages: number;
  total_weight: string;
  declared_value: string;
  origin: string;
  destination: string;
  freight_charge: string;
  insurance_charge: string;
  other_charges: string;
  total_charge: string;
  status: string;
  qr_code?: string;
  notes?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_rut?: string;
  customer_phone?: string;
  customer_email?: string;
  created_by_name?: string;
  packages?: Package[];
}

export interface CreateOrderDto {
  customer_id: string;
  declared_value: number;
  destination: string;
  origin?: string;
  notes?: string;
  special_instructions?: string;
  packages: Package[];
}

export interface OrderStats {
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
    total: number | null;
    totalPages: number | null;
  };
}

export const ordersApi = {
  // Get all orders with pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get order by ID with packages
  getById: async (id: string): Promise<{ success: boolean; data: Order }> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  create: async (data: CreateOrderDto): Promise<{ success: boolean; data: Order; message: string }> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Update order status
  updateStatus: async (id: string, status: string): Promise<{ success: boolean; data: Order; message: string }> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Get order statistics
  getStats: async (): Promise<{ success: boolean; data: OrderStats }> => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};

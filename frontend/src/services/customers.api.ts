// =========================================
// Customer API Service
// =========================================

import { api } from './api';

export interface Customer {
  id: string;
  rut: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  mobile?: string;
  address: string;
  city?: string;
  region?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerDto {
  rut: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  mobile?: string;
  address: string;
  city?: string;
  region?: string;
  notes?: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
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

export const customersApi = {
  // Get all customers with pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  // Get customer by ID
  getById: async (id: string): Promise<{ success: boolean; data: Customer }> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Create new customer
  create: async (data: CreateCustomerDto): Promise<{ success: boolean; data: Customer; message: string }> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  // Update customer
  update: async (id: string, data: Partial<CreateCustomerDto>): Promise<{ success: boolean; data: Customer; message: string }> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer (soft delete)
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Get customer statistics
  getStats: async (): Promise<{ success: boolean; data: CustomerStats }> => {
    const response = await api.get('/customers/stats');
    return response.data;
  },
};

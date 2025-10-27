// =========================================
// Freight Rates API Service
// =========================================

import { api } from './api';

export interface FreightRate {
  id: string;
  route_name: string;
  origin: string;
  destination: string;
  rate_per_kg: number;
  min_charge: number;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFreightRateDto {
  route_name: string;
  origin: string;
  destination: string;
  rate_per_kg: number;
  min_charge: number;
  effective_from: string;
  effective_to?: string;
}

export interface UpdateFreightRateDto {
  route_name?: string;
  origin?: string;
  destination?: string;
  rate_per_kg?: number;
  min_charge?: number;
  is_active?: boolean;
  effective_from?: string;
  effective_to?: string;
}

export interface FreightRateStats {
  total: number;
  active: number;
  inactive: number;
  avg_rate_per_kg: number;
  avg_min_charge: number;
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

export const freightRatesApi = {
  // Get all freight rates with pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<FreightRate>> => {
    const response = await api.get('/freight-rates', { params });
    return response.data;
  },

  // Get freight rate by ID
  getById: async (id: string): Promise<{ success: boolean; data: FreightRate }> => {
    const response = await api.get(`/freight-rates/${id}`);
    return response.data;
  },

  // Get active rates for a route
  getActiveRatesForRoute: async (origin: string, destination: string): Promise<{ success: boolean; data: FreightRate[] }> => {
    const response = await api.get('/freight-rates/route', { params: { origin, destination } });
    return response.data;
  },

  // Create new freight rate (admin only)
  create: async (data: CreateFreightRateDto): Promise<{ success: boolean; data: FreightRate; message: string }> => {
    const response = await api.post('/freight-rates', data);
    return response.data;
  },

  // Update freight rate (admin only)
  update: async (id: string, data: UpdateFreightRateDto): Promise<{ success: boolean; data: FreightRate; message: string }> => {
    const response = await api.put(`/freight-rates/${id}`, data);
    return response.data;
  },

  // Delete freight rate (admin only)
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/freight-rates/${id}`);
    return response.data;
  },

  // Get freight rate statistics (admin only)
  getStats: async (): Promise<{ success: boolean; data: FreightRateStats }> => {
    const response = await api.get('/freight-rates/stats');
    return response.data;
  },
};

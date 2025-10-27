// =========================================
// Insurance API Service
// =========================================

import { api } from './api';

export interface InsuranceConfig {
  id: string;
  name: string;
  rate: number; // Percentage as decimal
  min_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInsuranceConfigDto {
  name: string;
  rate: number;
  min_value: number;
}

export interface UpdateInsuranceConfigDto {
  name?: string;
  rate?: number;
  min_value?: number;
  is_active?: boolean;
}

export interface InsuranceConfigStats {
  total: number;
  active: number;
  inactive: number;
  avg_rate: number;
  avg_min_value: number;
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

export const insuranceApi = {
  // Get all insurance configs with pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<InsuranceConfig>> => {
    const response = await api.get('/insurance', { params });
    return response.data;
  },

  // Get insurance config by ID
  getById: async (id: string): Promise<{ success: boolean; data: InsuranceConfig }> => {
    const response = await api.get(`/insurance/${id}`);
    return response.data;
  },

  // Get active insurance configuration
  getActive: async (): Promise<{ success: boolean; data: InsuranceConfig | null }> => {
    const response = await api.get('/insurance/active');
    return response.data;
  },

  // Create new insurance config (admin only)
  create: async (data: CreateInsuranceConfigDto): Promise<{ success: boolean; data: InsuranceConfig; message: string }> => {
    const response = await api.post('/insurance', data);
    return response.data;
  },

  // Update insurance config (admin only)
  update: async (id: string, data: UpdateInsuranceConfigDto): Promise<{ success: boolean; data: InsuranceConfig; message: string }> => {
    const response = await api.put(`/insurance/${id}`, data);
    return response.data;
  },

  // Delete insurance config (admin only)
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/insurance/${id}`);
    return response.data;
  },

  // Get insurance config statistics (admin only)
  getStats: async (): Promise<{ success: boolean; data: InsuranceConfigStats }> => {
    const response = await api.get('/insurance/stats');
    return response.data;
  },
};

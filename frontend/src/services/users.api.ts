// =========================================
// Users API Service
// =========================================

import { api } from './api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'operator' | 'warehouse';
  phone?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'operator' | 'warehouse';
  phone?: string;
}

export interface UpdateUserDto {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'operator' | 'warehouse';
  phone?: string;
  is_active?: boolean;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface ResetPasswordDto {
  new_password: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  operators: number;
  warehouse: number;
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

export const usersApi = {
  // Get all users with pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<{ success: boolean; data: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user (admin only)
  create: async (data: CreateUserDto): Promise<{ success: boolean; data: User; message: string }> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user (admin only)
  update: async (id: string, data: UpdateUserDto): Promise<{ success: boolean; data: User; message: string }> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Change password
  changePassword: async (id: string, data: ChangePasswordDto): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/users/${id}/change-password`, data);
    return response.data;
  },

  // Reset password (admin only)
  resetPassword: async (id: string, data: ResetPasswordDto): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/users/${id}/reset-password`, data);
    return response.data;
  },

  // Delete user (admin only - soft delete)
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get user statistics (admin only)
  getStats: async (): Promise<{ success: boolean; data: UserStats }> => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

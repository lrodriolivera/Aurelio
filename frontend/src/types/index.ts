// =========================================
// Frontend TypeScript Types
// =========================================

export type UserRole = 'admin' | 'operator' | 'warehouse' | 'viewer';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Customer Types
export interface Customer {
  id: string;
  rut: string;
  business_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  region?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Order Types
export type OrderStatus =
  | 'CREATED'
  | 'RECIBIDO'
  | 'EN_BODEGA_ORIGEN'
  | 'EN_TRANSITO_PUERTO'
  | 'EN_BODEGA_PUERTO'
  | 'EN_TRANSITO_DESTINO'
  | 'EN_BODEGA_DESTINO'
  | 'LISTO_RETIRO'
  | 'ENTREGADO'
  | 'CANCELLED';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  total_packages: number;
  total_weight: number;
  declared_value: number;
  origin: string;
  destination: string;
  freight_charge: number;
  insurance_charge: number;
  total_charge: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

// Package Types
export interface Package {
  id: string;
  order_id: string;
  package_number: string;
  sequence_number: number;
  description?: string;
  weight: number;
  current_status: OrderStatus;
  current_location?: string;
  barcode?: string;
  created_at: string;
}

// Tracking Types
export interface TrackingState {
  state: OrderStatus;
  location?: string;
  description?: string;
  timestamp: string;
}

export interface PublicTrackingInfo {
  order_number: string;
  package_number: string;
  customer_name: string;
  origin: string;
  destination: string;
  current_status: OrderStatus;
  current_location?: string;
  estimated_arrival?: string;
  history: TrackingState[];
}

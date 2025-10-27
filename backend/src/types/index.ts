// =========================================
// TypeScript Interfaces and Types
// =========================================

import { Request } from 'express';

// =========================================
// AUTH TYPES
// =========================================
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export type UserRole = 'admin' | 'operator' | 'warehouse' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

// =========================================
// CUSTOMER TYPES
// =========================================
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
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomerDto {
  rut: string;
  business_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  region?: string;
  notes?: string;
}

// =========================================
// ORDER TYPES
// =========================================
export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  created_by: string;
  total_packages: number;
  total_weight: number;
  declared_value: number;
  origin: string;
  destination: string;
  freight_charge: number;
  insurance_charge: number;
  other_charges: number;
  total_charge: number;
  status: OrderStatus;
  qr_code?: string;
  notes?: string;
  special_instructions?: string;
  created_at: Date;
  updated_at: Date;
}

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

export interface CreateOrderDto {
  customer_id: string;
  packages: CreatePackageDto[];
  declared_value: number;
  destination: string;
  origin?: string;
  notes?: string;
  special_instructions?: string;
}

export interface FreightCalculation {
  weight: number;
  rate_per_kg: number;
  freight_charge: number;
  insurance_charge: number;
  total_charge: number;
}

// =========================================
// PACKAGE TYPES
// =========================================
export interface Package {
  id: string;
  order_id: string;
  package_number: string;
  description?: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  current_status: PackageStatus;
  label_printed: boolean;
  label_printed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type PackageStatus = OrderStatus;

export interface CreatePackageDto {
  description?: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  notes?: string;
}

// =========================================
// SHIPMENT TYPES
// =========================================
export interface Shipment {
  id: string;
  shipment_number: string;
  origin: string;
  destination: string;
  vehicle_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  scheduled_departure?: Date;
  actual_departure?: Date;
  estimated_arrival?: Date;
  actual_arrival?: Date;
  total_packages: number;
  total_weight: number;
  total_value: number;
  status: ShipmentStatus;
  manifest_generated: boolean;
  manifest_generated_at?: Date;
  manifest_url?: string;
  created_by: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type ShipmentStatus =
  | 'PLANNING'
  | 'LOADING'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CreateShipmentDto {
  origin: string;
  destination: string;
  vehicle_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  scheduled_departure?: Date;
  estimated_arrival?: Date;
  notes?: string;
}

// =========================================
// TRACKING TYPES
// =========================================
export interface TrackingState {
  id: string;
  package_id: string;
  order_id: string;
  state: PackageStatus;
  location?: string;
  description?: string;
  changed_by?: string;
  changed_at: Date;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface TrackingHistory {
  package: Package;
  order: Order;
  customer: Customer;
  states: TrackingState[];
}

export interface PublicTrackingInfo {
  order_number: string;
  package_number: string;
  customer_name: string;
  origin: string;
  destination: string;
  current_status: PackageStatus;
  estimated_arrival?: Date;
  history: Array<{
    state: PackageStatus;
    location?: string;
    description?: string;
    timestamp: Date;
  }>;
}

// =========================================
// DELIVERY TYPES
// =========================================
export interface Delivery {
  id: string;
  package_id: string;
  order_id: string;
  delivery_type: DeliveryType;
  recipient_name: string;
  recipient_rut?: string;
  recipient_phone?: string;
  signature_data?: string;
  signature_url?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_notes?: string;
  scheduled_at?: Date;
  delivered_at: Date;
  delivered_by?: string;
  status: DeliveryStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type DeliveryType = 'PICKUP' | 'HOME_DELIVERY';
export type DeliveryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface CreateDeliveryDto {
  package_id: string;
  delivery_type: DeliveryType;
  recipient_name: string;
  recipient_rut?: string;
  recipient_phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  scheduled_at?: Date;
  notes?: string;
}

// =========================================
// FREIGHT & INSURANCE TYPES
// =========================================
export interface FreightRate {
  id: string;
  route_name: string;
  origin: string;
  destination: string;
  rate_per_kg: number;
  min_charge: number;
  is_active: boolean;
  effective_from: Date;
  effective_to?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface InsuranceConfig {
  id: string;
  name: string;
  rate: number;
  min_value: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// =========================================
// NOTIFICATION TYPES
// =========================================
export interface Notification {
  id: string;
  customer_id?: string;
  order_id?: string;
  package_id?: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  message: string;
  status: NotificationStatus;
  sent_at?: Date;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export type NotificationType =
  | 'ORDER_CREATED'
  | 'PACKAGE_IN_TRANSIT'
  | 'PACKAGE_ARRIVED'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'DELAYED';

export type NotificationChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

// =========================================
// API RESPONSE TYPES
// =========================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// =========================================
// DASHBOARD TYPES
// =========================================
export interface DashboardStats {
  today_orders: number;
  pending_packages: number;
  in_transit_packages: number;
  ready_for_pickup: number;
  total_value_in_transit: number;
  active_shipments: number;
}

export interface ShipmentDashboard {
  shipment: Shipment;
  packages: Package[];
  total_value: number;
  loaded_packages: number;
  pending_packages: number;
}

// =========================================
// REPORT TYPES
// =========================================
export interface ReportFilters {
  start_date?: Date;
  end_date?: Date;
  customer_id?: string;
  origin?: string;
  destination?: string;
  status?: string;
}

export interface OrderReport {
  total_orders: number;
  total_packages: number;
  total_weight: number;
  total_value: number;
  total_freight: number;
  total_insurance: number;
  by_status: Record<string, number>;
  by_destination: Record<string, number>;
}

export * from './api-response.interface';
export * from './auth.interface';
export * from './category.interface';
export * from './status.interface';
export * from './asset.interface';
export * from './project.interface';
export * from './location.interface';
export * from './assignment.interface';
export * from './maintenance.interface';
export * from './report.interface';
export * from './setting.interface';

// Legacy compatibility definitions
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  department: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
}

export interface Custodian {
  id: string;
  name: string;
  position: string;
  department: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  locationId: string;
  custodianId: string;
  status: 'Operativo' | 'En mantenimiento' | 'En stock' | 'De baja';
  value: number;
  purchaseDate: string;
  brand: string;
  model: string;
  serialNumber: string;
  observations: string;
  image: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'PDF' | 'Excel';
  size: string;
  date: string;
}

export interface SystemSettings {
  companyName: string;
  nit: string;
  address: string;
  phone: string;
  currency: string;
  language: string;
  theme: string;
  appVersion: string;
  lastAuditDate: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalValue: number;
  operationalCount: number;
  maintenanceCount: number;
  recentActivities: ActivityLog[];
}

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
  businessName?: string;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  gstNumber?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class or hex
  isDefault?: boolean;
  sortOrder?: number;
  description?: string;
}

export type ProductStatus = 'active' | 'inactive' | 'discontinued';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  brand: string;
  modelNumber: string;
  description: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  imageUrl?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  categoryId: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  totalAmount: number;
  profit: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  saleDate: string;
}

export type NotificationType = 'low_stock' | 'out_of_stock' | 'new_product' | 'sale' | 'update' | 'info';

export interface Notification {
  id: string;
  businessId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  productId?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  businessId: string;
  action: string;
  entityType: 'product' | 'category' | 'inventory' | 'sale' | 'settings' | 'user';
  entityId?: string;
  details: string;
  createdAt: string;
}

export type NavigationTab = 
  | 'dashboard'
  | 'items'
  | 'products'
  | 'inventory'
  | 'sales'
  | 'analytics'
  | 'notifications'
  | 'settings'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-businesses'
  | 'admin-categories'
  | 'admin-activity';

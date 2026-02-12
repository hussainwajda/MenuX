// src/types/index.ts
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'COOKING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface Order {
  id: string;
  customer_name: string;
  table_number: string;
  items_count: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}

// src/types/index.ts
export interface KOTItem {
  name: string;
  variant?: string; // e.g., "Full" or "Barbecue"
  quantity: number;
  note?: string;    // e.g., "Less spicy"
}

export interface KOT {
  order_id: string;
  table_number: string;
  timestamp: string;
  items: KOTItem[];
}

// Menu Management Types
export interface MenuCategory {
  id: string;
  restaurantId?: string;
  name: string;
  sortOrder?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface MenuCategoryCreate {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MenuCategoryUpdate {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId?: string;
  name: string;
  description?: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  categoryId: string;
  createdAt: string;
  variants?: MenuVariant[];
}

export interface MenuItemCreate {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  isVeg?: boolean;
  isAvailable?: boolean;
  imageUrl?: string;
  categoryId?: string;
}

export interface MenuItemAvailability {
  isAvailable: boolean;
}

export interface MenuVariant {
  id: string;
  menuItemId?: string;
  name: string;
  priceDifference: number;
  createdAt: string;
}

export interface MenuVariantCreate {
  name: string;
  priceDifference: number;
}

export interface MenuVariantUpdate {
  name?: string;
  priceDifference?: number;
}

export interface MenuCategoryWithItems {
  id: string;
  name: string;
  sortOrder?: number | null;
  isActive: boolean;
  items: MenuItem[];
}

export interface MenuPreview {
  categories: MenuCategoryWithItems[];
}

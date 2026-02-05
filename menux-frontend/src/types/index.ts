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
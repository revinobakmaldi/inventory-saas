export type UserRole = "ADMIN" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  distributor_id?: string;
  outlet_id?: string;
}

export interface Outlet {
  id: string;
  name: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  is_active: boolean;
  created_at: string;
}

export type LedgerType = "IN" | "OUT" | "ADJUSTMENT";
export type StockEntryType = "IN" | "OUT" | "COUNT";

export interface StockEntry {
  id: string;
  outlet_id: string;
  product_id: string;
  type: LedgerType;
  quantity: number;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface StockCurrentItem {
  product_id: string;
  product_name: string;
  sku: string;
  unit: string;
  quantity: number;
}

export interface StockHistoryItem {
  id: string;
  outlet_id: string;
  outlet_name: string;
  product_id: string;
  product_name: string;
  type: LedgerType;
  quantity: number;
  notes?: string;
  created_by_name: string;
  created_at: string;
}

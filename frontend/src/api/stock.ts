import { client } from "./client";
import { StockCurrentItem, StockHistoryItem, StockEntryType } from "../types";

export const getStockSummary = () => client.get<{ outlet_id: string; product_id: string; quantity: number }[]>("/stock/admin/summary");
export const getOutletCurrentStock = (outletId: string) =>
  client.get<StockCurrentItem[]>(`/stock/${outletId}/current`);
export const recordStock = (outletId: string, data: { product_id: string; type: StockEntryType; quantity: number; notes?: string }) =>
  client.post(`/stock/${outletId}/entries`, data);
export const getHistory = (params: { outlet_id?: string; product_id?: string; from_date?: string; to_date?: string; page?: number; page_size?: number }) =>
  client.get<StockHistoryItem[]>("/stock/history", { params });

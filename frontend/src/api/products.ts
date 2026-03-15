import { client } from "./client";
import { Product } from "../types";

export const listProducts = (includeInactive = false) =>
  client.get<Product[]>(`/products/?include_inactive=${includeInactive}`);
export const createProduct = (data: { name: string; sku: string; unit: string }) =>
  client.post<Product>("/products/", data);
export const updateProduct = (id: string, data: Partial<Product>) =>
  client.patch<Product>(`/products/${id}`, data);
export const downloadQRPdf = () =>
  client.get("/products/qr/pdf", { responseType: "blob" });

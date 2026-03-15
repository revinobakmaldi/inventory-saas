import { client } from "./client";
import { Outlet } from "../types";

export const listOutlets = () => client.get<Outlet[]>("/outlets/");
export const createOutlet = (data: { name: string; address?: string }) =>
  client.post<Outlet>("/outlets/", data);
export const updateOutlet = (id: string, data: Partial<Outlet>) =>
  client.patch<Outlet>(`/outlets/${id}`, data);

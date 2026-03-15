import { client } from "./client";
import { User } from "../types";

export const signup = (data: {
  distributor_name: string;
  billing_email: string;
  admin_name: string;
  admin_email: string;
  password: string;
}) => client.post<{ access_token: string }>("/auth/signup", data);

export const login = (email: string, password: string) =>
  client.post<{ access_token: string }>("/auth/login", { email, password });

export const logout = () => client.post("/auth/logout");

export const getMe = () => client.get<User>("/auth/me");

import { client } from "./client";
import { User } from "../types";

export const listUsers = () => client.get<User[]>("/users/");
export const createUser = (data: { name: string; email: string; password: string; outlet_id: string }) =>
  client.post<User>("/users/", data);

import apiClient from "@/lib/apiClient";
import { AuthResponse, RegisterPayload, LoginPayload } from "./types";

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/register", payload);
  return res.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/login", payload);
  return res.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await apiClient.post("/auth/forgot-password", { email });
  return res.data;
}

export async function resetPassword(payload: any): Promise<{ message: string }> {
  const res = await apiClient.post("/auth/reset-password", payload);
  return res.data;
}

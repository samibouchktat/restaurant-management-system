import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>(
    "/api/auth/login",
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse login invalide");
  }

  return response.data.data;
}
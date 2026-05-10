import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  ResetPasswordRequest,
  UserCreateRequest,
  UserResponse,
  UserUpdateRequest,
} from "@/types/user";

export async function getUsers(): Promise<UserResponse[]> {
  const response = await api.get<ApiResponse<UserResponse[]>>("/api/users");

  return response.data.data ?? [];
}

export async function createUser(
  request: UserCreateRequest
): Promise<UserResponse> {
  const response = await api.post<ApiResponse<UserResponse>>(
    "/api/users",
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la création de l’utilisateur");
  }

  return response.data.data;
}

export async function updateUser(
  userId: number,
  request: UserUpdateRequest
): Promise<UserResponse> {
  const response = await api.put<ApiResponse<UserResponse>>(
    `/api/users/${userId}`,
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la modification de l’utilisateur");
  }

  return response.data.data;
}

export async function activateUser(userId: number): Promise<UserResponse> {
  const response = await api.patch<ApiResponse<UserResponse>>(
    `/api/users/${userId}/activate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de l’activation de l’utilisateur");
  }

  return response.data.data;
}

export async function deactivateUser(userId: number): Promise<UserResponse> {
  const response = await api.patch<ApiResponse<UserResponse>>(
    `/api/users/${userId}/deactivate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la désactivation de l’utilisateur");
  }

  return response.data.data;
}

export async function resetUserPassword(
  userId: number,
  request: ResetPasswordRequest
): Promise<UserResponse> {
  const response = await api.patch<ApiResponse<UserResponse>>(
    `/api/users/${userId}/reset-password`,
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la réinitialisation du mot de passe");
  }

  return response.data.data;
}
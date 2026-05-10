import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  CategoryCreateRequest,
  CategoryResponse,
  CategoryUpdateRequest,
} from "@/types/categories";

export async function getCategories(): Promise<CategoryResponse[]> {
  const response = await api.get<ApiResponse<CategoryResponse[]>>(
    "/api/categories"
  );

  return response.data.data ?? [];
}

export async function createCategory(
  request: CategoryCreateRequest
): Promise<CategoryResponse> {
  const response = await api.post<ApiResponse<CategoryResponse>>(
    "/api/categories",
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la création de la catégorie");
  }

  return response.data.data;
}

export async function updateCategory(
  categoryId: number,
  request: CategoryUpdateRequest
): Promise<CategoryResponse> {
  const response = await api.put<ApiResponse<CategoryResponse>>(
    `/api/categories/${categoryId}`,
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la modification de la catégorie");
  }

  return response.data.data;
}

export async function activateCategory(
  categoryId: number
): Promise<CategoryResponse> {
  const response = await api.patch<ApiResponse<CategoryResponse>>(
    `/api/categories/${categoryId}/activate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de l’activation de la catégorie");
  }

  return response.data.data;
}

export async function deactivateCategory(
  categoryId: number
): Promise<CategoryResponse> {
  const response = await api.patch<ApiResponse<CategoryResponse>>(
    `/api/categories/${categoryId}/deactivate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la désactivation de la catégorie");
  }

  return response.data.data;
}
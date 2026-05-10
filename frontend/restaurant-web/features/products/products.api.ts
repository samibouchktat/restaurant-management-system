import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  ProductCreateRequest,
  ProductResponse,
  ProductUpdateRequest,
} from "@/types/product";

export async function getProducts(): Promise<ProductResponse[]> {
  const response = await api.get<ApiResponse<ProductResponse[]>>(
    "/api/products"
  );

  return response.data.data ?? [];
}

export async function createProduct(
  request: ProductCreateRequest
): Promise<ProductResponse> {
  const response = await api.post<ApiResponse<ProductResponse>>(
    "/api/products",
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la création du produit");
  }

  return response.data.data;
}

export async function updateProduct(
  productId: number,
  request: ProductUpdateRequest
): Promise<ProductResponse> {
  const response = await api.put<ApiResponse<ProductResponse>>(
    `/api/products/${productId}`,
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la modification du produit");
  }

  return response.data.data;
}

export async function activateProduct(
  productId: number
): Promise<ProductResponse> {
  const response = await api.patch<ApiResponse<ProductResponse>>(
    `/api/products/${productId}/activate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de l’activation du produit");
  }

  return response.data.data;
}

export async function deactivateProduct(
  productId: number
): Promise<ProductResponse> {
  const response = await api.patch<ApiResponse<ProductResponse>>(
    `/api/products/${productId}/deactivate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la désactivation du produit");
  }

  return response.data.data;
}

export async function markProductAsAvailable(
  productId: number
): Promise<ProductResponse> {
  const response = await api.patch<ApiResponse<ProductResponse>>(
    `/api/products/${productId}/available`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la disponibilité du produit");
  }

  return response.data.data;
}

export async function markProductAsUnavailable(
  productId: number
): Promise<ProductResponse> {
  const response = await api.patch<ApiResponse<ProductResponse>>(
    `/api/products/${productId}/unavailable`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de l’indisponibilité du produit");
  }

  return response.data.data;
}
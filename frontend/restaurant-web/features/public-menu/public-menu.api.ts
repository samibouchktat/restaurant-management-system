import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { PublicMenuCategoryResponse } from "@/types/product";

export async function getPublicMenu(): Promise<PublicMenuCategoryResponse[]> {
  const response = await api.get<ApiResponse<PublicMenuCategoryResponse[]>>(
    "/api/public/menu"
  );

  return response.data.data ?? [];
}
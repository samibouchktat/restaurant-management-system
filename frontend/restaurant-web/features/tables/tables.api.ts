import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  TableResponse,
  TableStatus,
  TableStatusUpdateRequest,
} from "@/types/table";

export async function getFloorPlan(): Promise<TableResponse[]> {
  const response = await api.get<ApiResponse<TableResponse[]>>(
    "/api/tables/floor-plan"
  );

  return response.data.data ?? [];
}

export async function getTablesByServer(
  serverId: number
): Promise<TableResponse[]> {
  const response = await api.get<ApiResponse<TableResponse[]>>(
    `/api/tables/by-server/${serverId}`
  );

  return response.data.data ?? [];
}

export async function updateTableStatus(
  tableId: number,
  status: TableStatus
): Promise<TableResponse> {
  const payload: TableStatusUpdateRequest = {
    status,
  };

  const response = await api.patch<ApiResponse<TableResponse>>(
    `/api/tables/${tableId}/status`,
    payload
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la mise à jour de la table");
  }

  return response.data.data;
}
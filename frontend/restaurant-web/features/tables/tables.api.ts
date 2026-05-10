import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  TableCreateRequest,
  TableResponse,
  TableStatus,
  TableStatusUpdateRequest,
  TableUpdateRequest,
} from "@/types/table";

export async function getTables(): Promise<TableResponse[]> {
  const response = await api.get<ApiResponse<TableResponse[]>>("/api/tables");

  return response.data.data ?? [];
}

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

export async function createTable(
  request: TableCreateRequest
): Promise<TableResponse> {
  const response = await api.post<ApiResponse<TableResponse>>(
    "/api/tables",
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la création de la table");
  }

  return response.data.data;
}

export async function updateTable(
  tableId: number,
  request: TableUpdateRequest
): Promise<TableResponse> {
  const response = await api.put<ApiResponse<TableResponse>>(
    `/api/tables/${tableId}`,
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la modification de la table");
  }

  return response.data.data;
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

export async function activateTable(tableId: number): Promise<TableResponse> {
  const response = await api.patch<ApiResponse<TableResponse>>(
    `/api/tables/${tableId}/activate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de l’activation de la table");
  }

  return response.data.data;
}

export async function deactivateTable(tableId: number): Promise<TableResponse> {
  const response = await api.patch<ApiResponse<TableResponse>>(
    `/api/tables/${tableId}/deactivate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la désactivation de la table");
  }

  return response.data.data;
}
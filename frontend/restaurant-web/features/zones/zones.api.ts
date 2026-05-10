import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  AssignServerRequest,
  ZoneCreateRequest,
  ZoneResponse,
  ZoneUpdateRequest,
} from "@/types/zone";

export async function getZones(): Promise<ZoneResponse[]> {
  const response = await api.get<ApiResponse<ZoneResponse[]>>("/api/zones");

  return response.data.data ?? [];
}

export async function createZone(
  request: ZoneCreateRequest
): Promise<ZoneResponse> {
  const response = await api.post<ApiResponse<ZoneResponse>>(
    "/api/zones",
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la création de la zone");
  }

  return response.data.data;
}

export async function updateZone(
  zoneId: number,
  request: ZoneUpdateRequest
): Promise<ZoneResponse> {
  const response = await api.put<ApiResponse<ZoneResponse>>(
    `/api/zones/${zoneId}`,
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la modification de la zone");
  }

  return response.data.data;
}

export async function activateZone(zoneId: number): Promise<ZoneResponse> {
  const response = await api.patch<ApiResponse<ZoneResponse>>(
    `/api/zones/${zoneId}/activate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de l’activation de la zone");
  }

  return response.data.data;
}

export async function deactivateZone(zoneId: number): Promise<ZoneResponse> {
  const response = await api.patch<ApiResponse<ZoneResponse>>(
    `/api/zones/${zoneId}/deactivate`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la désactivation de la zone");
  }

  return response.data.data;
}

export async function assignServerToZone(
  zoneId: number,
  request: AssignServerRequest
): Promise<ZoneResponse> {
  const response = await api.patch<ApiResponse<ZoneResponse>>(
    `/api/zones/${zoneId}/assign-server`,
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de l’affectation du serveur");
  }

  return response.data.data;
}

export async function removeAssignedServer(
  zoneId: number
): Promise<ZoneResponse> {
  const response = await api.patch<ApiResponse<ZoneResponse>>(
    `/api/zones/${zoneId}/remove-server`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors du retrait du serveur");
  }

  return response.data.data;
}
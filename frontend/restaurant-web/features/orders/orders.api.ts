import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  OrderResponse,
  OrderStatus,
  UpdateOrderStatusRequest,
  CreateQrOrderRequest,
} from "@/types/order";

export async function getActiveOrders(): Promise<OrderResponse[]> {
  const response = await api.get<ApiResponse<OrderResponse[]>>(
    "/api/orders/active"
  );

  return response.data.data ?? [];
}

export async function getActiveOrdersByServer(
  serverId: number
): Promise<OrderResponse[]> {
  const response = await api.get<ApiResponse<OrderResponse[]>>(
    `/api/orders/by-server/${serverId}/active`
  );

  return response.data.data ?? [];
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<OrderResponse> {
  const payload: UpdateOrderStatusRequest = {
    status,
  };

  const response = await api.patch<ApiResponse<OrderResponse>>(
    `/api/orders/${orderId}/status`,
    payload
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la mise à jour de la commande");
  }

  return response.data.data;
}
export async function createQrOrder(
  request: CreateQrOrderRequest
): Promise<OrderResponse> {
  const response = await api.post<ApiResponse<OrderResponse>>(
    "/api/orders/qr",
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la création de la commande QR");
  }

  return response.data.data;
}
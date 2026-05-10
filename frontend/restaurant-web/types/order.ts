export type OrderOrigin = "QR" | "SERVEUR";

export type OrderStatus =
  | "EN_ATTENTE"
  | "EN_PREPARATION"
  | "SERVIE"
  | "FACTUREE"
  | "ANNULEE";

export type OrderItemRequest = {
  productId: number;
  quantity: number;
};

export type OrderItemResponse = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CreateQrOrderRequest = {
  tableId: number;
  items: OrderItemRequest[];
};

export type CreateServerOrderRequest = {
  tableId: number;
  serverId: number;
  items: OrderItemRequest[];
};

export type UpdateOrderRequest = {
  items: OrderItemRequest[];
};

export type UpdateOrderStatusRequest = {
  status: OrderStatus;
};

export type CancelOrderRequest = {
  reason: string;
};

export type OrderResponse = {
  id: number;
  tableId: number;
  tableNumber: string;
  serverId?: number | null;
  serverInternalId?: string | null;
  serverFullName?: string | null;
  origin: OrderOrigin;
  status: OrderStatus;
  items: OrderItemResponse[];
  totalAmount: number;
  cancelReason?: string | null;
  orderedAt: string;
  updatedAt: string;
  cancelledAt?: string | null;
};
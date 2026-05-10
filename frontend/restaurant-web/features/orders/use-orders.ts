"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQrOrder,
  getActiveOrders,
  getActiveOrdersByServer,
  updateOrderStatus,
} from "./orders.api";
import type { OrderStatus } from "@/types/order";

export const orderQueryKeys = {
  all: ["orders"] as const,
  active: ["orders", "active"] as const,
  activeByServer: (serverId: number) =>
    ["orders", "active", "server", serverId] as const,
};

export function useActiveOrders() {
  return useQuery({
    queryKey: orderQueryKeys.active,
    queryFn: getActiveOrders,
  });
}

export function useActiveOrdersByServer(serverId?: number) {
  return useQuery({
    queryKey: serverId
      ? orderQueryKeys.activeByServer(serverId)
      : ["orders", "active", "server", "unknown"],
    queryFn: () => getActiveOrdersByServer(serverId as number),
    enabled: Boolean(serverId),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: number;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["tables"],
      });
    },
  });
  
}
export function useCreateQrOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQrOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["tables"],
      });
    },
  });
}
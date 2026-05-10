"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFloorPlan,
  getTablesByServer,
  updateTableStatus,
} from "./tables.api";
import type { TableStatus } from "@/types/table";

export const tableQueryKeys = {
  all: ["tables"] as const,
  floorPlan: ["tables", "floor-plan"] as const,
  byServer: (serverId: number) => ["tables", "server", serverId] as const,
};

export function useFloorPlan() {
  return useQuery({
    queryKey: tableQueryKeys.floorPlan,
    queryFn: getFloorPlan,
  });
}

export function useTablesByServer(serverId?: number) {
  return useQuery({
    queryKey: serverId
      ? tableQueryKeys.byServer(serverId)
      : ["tables", "server", "unknown"],
    queryFn: () => getTablesByServer(serverId as number),
    enabled: Boolean(serverId),
  });
}

export function useUpdateTableStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tableId,
      status,
    }: {
      tableId: number;
      status: TableStatus;
    }) => updateTableStatus(tableId, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tableQueryKeys.all,
      });
    },
  });
}
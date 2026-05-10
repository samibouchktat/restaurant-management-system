"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateTable,
  createTable,
  deactivateTable,
  getFloorPlan,
  getTables,
  getTablesByServer,
  updateTable,
  updateTableStatus,
} from "./tables.api";
import type {
  TableCreateRequest,
  TableStatus,
  TableUpdateRequest,
} from "@/types/table";

export const tableQueryKeys = {
  all: ["tables"] as const,
  list: ["tables", "list"] as const,
  floorPlan: ["tables", "floor-plan"] as const,
  byServer: (serverId: number) => ["tables", "server", serverId] as const,
};

export function useTables() {
  return useQuery({
    queryKey: tableQueryKeys.list,
    queryFn: getTables,
  });
}

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

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TableCreateRequest) => createTable(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableQueryKeys.all });
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tableId,
      request,
    }: {
      tableId: number;
      request: TableUpdateRequest;
    }) => updateTable(tableId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableQueryKeys.all });
    },
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
      queryClient.invalidateQueries({ queryKey: tableQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useActivateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableQueryKeys.all });
    },
  });
}

export function useDeactivateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableQueryKeys.all });
    },
  });
}
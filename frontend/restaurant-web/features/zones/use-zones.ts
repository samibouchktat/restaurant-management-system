"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateZone,
  assignServerToZone,
  createZone,
  deactivateZone,
  getZones,
  removeAssignedServer,
  updateZone,
} from "./zones.api";
import type {
  AssignServerRequest,
  ZoneCreateRequest,
  ZoneUpdateRequest,
} from "@/types/zone";

export const zoneQueryKeys = {
  all: ["zones"] as const,
};

export function useZones() {
  return useQuery({
    queryKey: zoneQueryKeys.all,
    queryFn: getZones,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ZoneCreateRequest) => createZone(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      request,
    }: {
      zoneId: number;
      request: ZoneUpdateRequest;
    }) => updateZone(zoneId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

export function useActivateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

export function useDeactivateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

export function useAssignServerToZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      request,
    }: {
      zoneId: number;
      request: AssignServerRequest;
    }) => assignServerToZone(zoneId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

export function useRemoveAssignedServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeAssignedServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}
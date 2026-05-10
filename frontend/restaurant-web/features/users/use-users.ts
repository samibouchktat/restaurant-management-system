"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateUser,
  createUser,
  deactivateUser,
  getUsers,
  resetUserPassword,
  updateUser,
} from "./users.api";
import type {
  ResetPasswordRequest,
  UserCreateRequest,
  UserUpdateRequest,
} from "@/types/user";

export const userQueryKeys = {
  all: ["users"] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userQueryKeys.all,
    queryFn: getUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UserCreateRequest) => createUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      request,
    }: {
      userId: number;
      request: UserUpdateRequest;
    }) => updateUser(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      request,
    }: {
      userId: number;
      request: ResetPasswordRequest;
    }) => resetUserPassword(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}
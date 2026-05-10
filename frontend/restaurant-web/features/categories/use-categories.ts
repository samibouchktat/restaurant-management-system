"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateCategory,
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory,
} from "./categories.api";
import type {
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from "@/types/categories";

export const categoryQueryKeys = {
  all: ["categories"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryQueryKeys.all,
    queryFn: getCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CategoryCreateRequest) => createCategory(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      request,
    }: {
      categoryId: number;
      request: CategoryUpdateRequest;
    }) => updateCategory(categoryId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}

export function useActivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}
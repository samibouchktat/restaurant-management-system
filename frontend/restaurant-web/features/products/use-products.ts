"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateProduct,
  createProduct,
  deactivateProduct,
  getProducts,
  markProductAsAvailable,
  markProductAsUnavailable,
  updateProduct,
} from "./products.api";
import type {
  ProductCreateRequest,
  ProductUpdateRequest,
} from "@/types/product";

export const productQueryKeys = {
  all: ["products"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productQueryKeys.all,
    queryFn: getProducts,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ProductCreateRequest) => createProduct(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      request,
    }: {
      productId: number;
      request: ProductUpdateRequest;
    }) => updateProduct(productId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}

export function useActivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}

export function useMarkProductAsAvailable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markProductAsAvailable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}

export function useMarkProductAsUnavailable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markProductAsUnavailable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}
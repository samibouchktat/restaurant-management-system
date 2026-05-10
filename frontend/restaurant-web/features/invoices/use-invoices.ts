"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyInvoiceDiscount,
  generateInvoiceFromOrder,
  getInvoices,
  validateInvoicePayment,
} from "./invoices.api";
import type {
  ApplyDiscountRequest,
  InvoiceStatus,
  ValidatePaymentRequest,
} from "@/types/invoice";

export const invoiceQueryKeys = {
  all: ["invoices"] as const,
  list: (status?: InvoiceStatus) =>
    status ? (["invoices", status] as const) : (["invoices", "all"] as const),
};

export function useInvoices(status?: InvoiceStatus) {
  return useQuery({
    queryKey: invoiceQueryKeys.list(status),
    queryFn: () => getInvoices(status),
  });
}

export function useGenerateInvoiceFromOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateInvoiceFromOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

export function useApplyInvoiceDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      request,
    }: {
      invoiceId: number;
      request: ApplyDiscountRequest;
    }) => applyInvoiceDiscount(invoiceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
    },
  });
}

export function useValidateInvoicePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      request,
    }: {
      invoiceId: number;
      request: ValidatePaymentRequest;
    }) => validateInvoicePayment(invoiceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}
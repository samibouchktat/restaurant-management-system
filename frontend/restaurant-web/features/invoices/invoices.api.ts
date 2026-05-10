import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  ApplyDiscountRequest,
  InvoiceResponse,
  InvoiceStatus,
  ValidatePaymentRequest,
} from "@/types/invoice";

export async function getInvoices(
  status?: InvoiceStatus
): Promise<InvoiceResponse[]> {
  const response = await api.get<ApiResponse<InvoiceResponse[]>>(
    "/api/invoices",
    {
      params: status ? { status } : undefined,
    }
  );

  return response.data.data ?? [];
}

export async function generateInvoiceFromOrder(
  orderId: number
): Promise<InvoiceResponse> {
  const response = await api.post<ApiResponse<InvoiceResponse>>(
    `/api/invoices/from-order/${orderId}`
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la génération de la facture");
  }

  return response.data.data;
}

export async function applyInvoiceDiscount(
  invoiceId: number,
  request: ApplyDiscountRequest
): Promise<InvoiceResponse> {
  const response = await api.patch<ApiResponse<InvoiceResponse>>(
    `/api/invoices/${invoiceId}/discount`,
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de l’application de la remise");
  }

  return response.data.data;
}

export async function validateInvoicePayment(
  invoiceId: number,
  request: ValidatePaymentRequest
): Promise<InvoiceResponse> {
  const response = await api.patch<ApiResponse<InvoiceResponse>>(
    `/api/invoices/${invoiceId}/payment`,
    request
  );

  if (!response.data.data) {
    throw new Error("Réponse invalide lors de la validation du paiement");
  }

  return response.data.data;
}
export type DiscountType = "NONE" | "PERCENTAGE" | "FIXED_AMOUNT";

export type InvoiceStatus = "DRAFT" | "PAID" | "CANCELLED";

export type PaymentMode = "ESPECES" | "CARTE" | "VIREMENT";

export type InvoiceResponse = {
  id: number;
  invoiceNumber: string;

  orderId: number;
  tableId: number;
  tableNumber: string;

  serverId?: number | null;
  serverInternalId?: string | null;
  serverFullName?: string | null;

  orderOrigin: "QR" | "SERVEUR";

  subtotalAmount: number;

  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;

  taxRate: number;
  taxAmount: number;

  totalAmount: number;

  paymentMode?: PaymentMode | null;
  status: InvoiceStatus;

  generatedAt: string;
  updatedAt: string;
  paidAt?: string | null;
};

export type ApplyDiscountRequest = {
  discountType: DiscountType;
  discountValue: number;
};

export type ValidatePaymentRequest = {
  paymentMode: PaymentMode;
};
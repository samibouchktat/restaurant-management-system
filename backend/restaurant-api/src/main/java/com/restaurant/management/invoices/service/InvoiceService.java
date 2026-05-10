package com.restaurant.management.invoices.service;

import com.restaurant.management.common.enums.InvoiceStatus;
import com.restaurant.management.invoices.dto.ApplyDiscountRequest;
import com.restaurant.management.invoices.dto.InvoiceResponse;
import com.restaurant.management.invoices.dto.ValidatePaymentRequest;

import java.util.List;

public interface InvoiceService {

    InvoiceResponse generateInvoiceFromOrder(Long orderId);

    InvoiceResponse applyDiscount(Long invoiceId, ApplyDiscountRequest request);

    InvoiceResponse validatePayment(Long invoiceId, ValidatePaymentRequest request);

    List<InvoiceResponse> getAllInvoices();

    List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status);

    InvoiceResponse getInvoiceById(Long id);

    InvoiceResponse getInvoiceByOrderId(Long orderId);
}
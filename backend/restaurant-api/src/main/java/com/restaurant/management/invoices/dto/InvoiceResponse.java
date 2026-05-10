package com.restaurant.management.invoices.dto;

import com.restaurant.management.common.enums.DiscountType;
import com.restaurant.management.common.enums.InvoiceStatus;
import com.restaurant.management.common.enums.OrderOrigin;
import com.restaurant.management.common.enums.PaymentMode;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;

    private Long orderId;
    private Long tableId;
    private String tableNumber;

    private Long serverId;
    private String serverInternalId;
    private String serverFullName;

    private OrderOrigin orderOrigin;

    private BigDecimal subtotalAmount;

    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;

    private BigDecimal taxRate;
    private BigDecimal taxAmount;

    private BigDecimal totalAmount;

    private PaymentMode paymentMode;
    private InvoiceStatus status;

    private LocalDateTime generatedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
}
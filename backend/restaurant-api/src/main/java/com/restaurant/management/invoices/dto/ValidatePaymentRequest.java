package com.restaurant.management.invoices.dto;

import com.restaurant.management.common.enums.PaymentMode;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidatePaymentRequest {

    @NotNull(message = "Payment mode is required")
    private PaymentMode paymentMode;
}
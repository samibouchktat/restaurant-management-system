package com.restaurant.management.invoices.dto;

import com.restaurant.management.common.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ApplyDiscountRequest {

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.00", message = "Discount value must be greater than or equal to 0")
    private BigDecimal discountValue;
}
package com.restaurant.management.orders.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateServerOrderRequest {

    @NotNull(message = "Table ID is required")
    private Long tableId;

    @NotNull(message = "Server ID is required")
    private Long serverId;

    @Valid
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemRequest> items;
}
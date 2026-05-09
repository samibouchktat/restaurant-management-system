package com.restaurant.management.orders.dto;

import com.restaurant.management.common.enums.OrderOrigin;
import com.restaurant.management.common.enums.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {

    private Long id;

    private Long tableId;
    private String tableNumber;

    private Long serverId;
    private String serverInternalId;
    private String serverFullName;

    private OrderOrigin origin;
    private OrderStatus status;

    private List<OrderItemResponse> items;

    private BigDecimal totalAmount;
    private String cancelReason;

    private LocalDateTime orderedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime cancelledAt;
}
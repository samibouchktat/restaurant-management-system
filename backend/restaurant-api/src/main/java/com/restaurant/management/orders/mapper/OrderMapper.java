package com.restaurant.management.orders.mapper;

import com.restaurant.management.orders.dto.OrderItemResponse;
import com.restaurant.management.orders.dto.OrderResponse;
import com.restaurant.management.orders.entity.CustomerOrder;
import com.restaurant.management.orders.entity.OrderItem;
import com.restaurant.management.products.entity.Product;
import com.restaurant.management.tables.entity.RestaurantTable;
import com.restaurant.management.users.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class OrderMapper {

    public OrderItem toOrderItem(Product product, Integer quantity) {
        BigDecimal unitPrice = product.getPrice();
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

        return OrderItem.builder()
                .product(product)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .lineTotal(lineTotal)
                .build();
    }

    public OrderItemResponse toItemResponse(OrderItem item) {
        Product product = item.getProduct();

        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }

    public OrderResponse toResponse(CustomerOrder order) {
        RestaurantTable table = order.getTable();
        User server = order.getServer();

        List<OrderItemResponse> itemResponses = order.getItems()
                .stream()
                .map(this::toItemResponse)
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .tableId(table != null ? table.getId() : null)
                .tableNumber(table != null ? table.getTableNumber() : null)
                .serverId(server != null ? server.getId() : null)
                .serverInternalId(server != null ? server.getInternalId() : null)
                .serverFullName(server != null
                        ? server.getFirstName() + " " + server.getLastName()
                        : null)
                .origin(order.getOrigin())
                .status(order.getStatus())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .cancelReason(order.getCancelReason())
                .orderedAt(order.getOrderedAt())
                .updatedAt(order.getUpdatedAt())
                .cancelledAt(order.getCancelledAt())
                .build();
    }
}
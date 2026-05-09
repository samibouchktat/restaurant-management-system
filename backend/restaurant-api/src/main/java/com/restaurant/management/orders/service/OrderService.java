package com.restaurant.management.orders.service;

import com.restaurant.management.orders.dto.CancelOrderRequest;
import com.restaurant.management.orders.dto.CreateQrOrderRequest;
import com.restaurant.management.orders.dto.CreateServerOrderRequest;
import com.restaurant.management.orders.dto.OrderResponse;
import com.restaurant.management.orders.dto.UpdateOrderRequest;
import com.restaurant.management.orders.dto.UpdateOrderStatusRequest;

import java.util.List;

public interface OrderService {

    OrderResponse createQrOrder(CreateQrOrderRequest request);

    OrderResponse createServerOrder(CreateServerOrderRequest request);

    List<OrderResponse> getAllOrders();

    List<OrderResponse> getActiveOrders();

    List<OrderResponse> getOrdersByServer(Long serverId);

    List<OrderResponse> getActiveOrdersByServer(Long serverId);

    List<OrderResponse> getOrdersByTable(Long tableId);

    OrderResponse getOrderById(Long id);

    OrderResponse updateOrder(Long id, UpdateOrderRequest request);

    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    OrderResponse cancelOrder(Long id, CancelOrderRequest request);
}
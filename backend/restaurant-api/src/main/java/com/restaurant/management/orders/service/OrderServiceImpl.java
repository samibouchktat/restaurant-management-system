package com.restaurant.management.orders.service;

import com.restaurant.management.common.enums.OrderOrigin;
import com.restaurant.management.common.enums.OrderStatus;
import com.restaurant.management.common.enums.TableStatus;
import com.restaurant.management.common.enums.UserRole;
import com.restaurant.management.common.exceptions.BadRequestException;
import com.restaurant.management.common.exceptions.ResourceNotFoundException;
import com.restaurant.management.orders.dto.CancelOrderRequest;
import com.restaurant.management.orders.dto.CreateQrOrderRequest;
import com.restaurant.management.orders.dto.CreateServerOrderRequest;
import com.restaurant.management.orders.dto.OrderItemRequest;
import com.restaurant.management.orders.dto.OrderResponse;
import com.restaurant.management.orders.dto.UpdateOrderRequest;
import com.restaurant.management.orders.dto.UpdateOrderStatusRequest;
import com.restaurant.management.orders.entity.CustomerOrder;
import com.restaurant.management.orders.entity.OrderItem;
import com.restaurant.management.orders.mapper.OrderMapper;
import com.restaurant.management.orders.repository.CustomerOrderRepository;
import com.restaurant.management.products.entity.Product;
import com.restaurant.management.products.repository.ProductRepository;
import com.restaurant.management.tables.entity.RestaurantTable;
import com.restaurant.management.tables.repository.RestaurantTableRepository;
import com.restaurant.management.users.entity.User;
import com.restaurant.management.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final List<OrderStatus> ACTIVE_ORDER_STATUSES = List.of(
            OrderStatus.EN_ATTENTE,
            OrderStatus.EN_PREPARATION,
            OrderStatus.SERVIE
    );

    private final CustomerOrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    @Override
    public OrderResponse createQrOrder(CreateQrOrderRequest request) {
        RestaurantTable table = findTableById(request.getTableId());

        validateTableCanReceiveOrder(table);

        User assignedServer = table.getZone().getAssignedServer();

        if (assignedServer == null) {
            throw new BadRequestException("No server assigned to the table zone");
        }

        if (!assignedServer.isActive()) {
            throw new BadRequestException("Assigned server is inactive");
        }

        if (!UserRole.SERVEUR.equals(assignedServer.getRole())) {
            throw new BadRequestException("Assigned user must have SERVEUR role");
        }

        CustomerOrder order = CustomerOrder.builder()
                .table(table)
                .server(assignedServer)
                .origin(OrderOrigin.QR)
                .status(OrderStatus.EN_ATTENTE)
                .totalAmount(BigDecimal.ZERO)
                .build();

        attachItemsAndCalculateTotal(order, request.getItems());

        CustomerOrder savedOrder = orderRepository.save(order);

        table.setStatus(TableStatus.EN_ATTENTE);
        tableRepository.save(table);

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    public OrderResponse createServerOrder(CreateServerOrderRequest request) {
        RestaurantTable table = findTableById(request.getTableId());
        User server = findUserById(request.getServerId());

        validateTableCanReceiveOrder(table);
        validateServer(server);

        CustomerOrder order = CustomerOrder.builder()
                .table(table)
                .server(server)
                .origin(OrderOrigin.SERVEUR)
                .status(OrderStatus.EN_ATTENTE)
                .totalAmount(BigDecimal.ZERO)
                .build();

        attachItemsAndCalculateTotal(order, request.getItems());

        CustomerOrder savedOrder = orderRepository.save(order);

        table.setStatus(TableStatus.OCCUPEE);
        tableRepository.save(table);

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(CustomerOrder::getOrderedAt).reversed())
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getActiveOrders() {
        return orderRepository.findByStatusIn(ACTIVE_ORDER_STATUSES)
                .stream()
                .sorted(Comparator.comparing(CustomerOrder::getOrderedAt).reversed())
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByServer(Long serverId) {
        User server = findUserById(serverId);
        validateServer(server);

        return orderRepository.findByServer(server)
                .stream()
                .sorted(Comparator.comparing(CustomerOrder::getOrderedAt).reversed())
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getActiveOrdersByServer(Long serverId) {
        User server = findUserById(serverId);
        validateServer(server);

        return orderRepository.findByServerAndStatusIn(server, ACTIVE_ORDER_STATUSES)
                .stream()
                .sorted(Comparator.comparing(CustomerOrder::getOrderedAt).reversed())
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByTable(Long tableId) {
        RestaurantTable table = findTableById(tableId);

        return orderRepository.findByTable(table)
                .stream()
                .sorted(Comparator.comparing(CustomerOrder::getOrderedAt).reversed())
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        CustomerOrder order = findOrderById(id);
        return orderMapper.toResponse(order);
    }

    @Override
    public OrderResponse updateOrder(Long id, UpdateOrderRequest request) {
        CustomerOrder order = findOrderById(id);

        validateOrderCanBeModified(order);

        order.clearItems();

        attachItemsAndCalculateTotal(order, request.getItems());

        CustomerOrder updatedOrder = orderRepository.save(order);

        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        CustomerOrder order = findOrderById(id);

        if (order.isCancelled()) {
            throw new BadRequestException("Cancelled order cannot be updated");
        }

        if (OrderStatus.ANNULEE.equals(request.getStatus())) {
            throw new BadRequestException("Use cancel endpoint to cancel an order");
        }

        validateStatusTransition(order.getStatus(), request.getStatus());

        order.setStatus(request.getStatus());

        updateTableStatusAfterOrderStatusChange(order);

        CustomerOrder updatedOrder = orderRepository.save(order);

        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    public OrderResponse cancelOrder(Long id, CancelOrderRequest request) {
        CustomerOrder order = findOrderById(id);

        if (order.isFinalStatus()) {
            throw new BadRequestException("Finalized order cannot be cancelled");
        }

        order.setStatus(OrderStatus.ANNULEE);
        order.setCancelReason(request.getReason().trim());

        RestaurantTable table = order.getTable();
        table.setStatus(TableStatus.LIBRE);
        tableRepository.save(table);

        CustomerOrder cancelledOrder = orderRepository.save(order);

        return orderMapper.toResponse(cancelledOrder);
    }

    private void attachItemsAndCalculateTotal(CustomerOrder order, List<OrderItemRequest> itemRequests) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : itemRequests) {
            Product product = findProductById(itemRequest.getProductId());

            validateProductCanBeOrdered(product);

            OrderItem item = orderMapper.toOrderItem(product, itemRequest.getQuantity());
            item.recalculateLineTotal();

            order.addItem(item);

            totalAmount = totalAmount.add(item.getLineTotal());
        }

        order.setTotalAmount(totalAmount);
    }

    private void validateTableCanReceiveOrder(RestaurantTable table) {
        if (!table.isActive()) {
            throw new BadRequestException("Cannot create order for an inactive table");
        }

        orderRepository.findFirstByTableAndStatusIn(table, ACTIVE_ORDER_STATUSES)
                .ifPresent(existingOrder -> {
                    throw new BadRequestException("Table already has an active order");
                });
    }

    private void validateProductCanBeOrdered(Product product) {
        if (!product.isActive()) {
            throw new BadRequestException("Product is inactive: " + product.getName());
        }

        if (!product.isAvailable()) {
            throw new BadRequestException("Product is unavailable: " + product.getName());
        }

        if (product.getCategory() == null || !product.getCategory().isActive()) {
            throw new BadRequestException("Product category is inactive: " + product.getName());
        }
    }

    private void validateOrderCanBeModified(CustomerOrder order) {
        if (order.isCancelled()) {
            throw new BadRequestException("Cancelled order cannot be modified");
        }

        if (OrderStatus.FACTUREE.equals(order.getStatus())) {
            throw new BadRequestException("Invoiced order cannot be modified");
        }

        if (OrderStatus.SERVIE.equals(order.getStatus())) {
            throw new BadRequestException("Served order cannot be modified");
        }
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus.equals(newStatus)) {
            throw new BadRequestException("Order already has this status");
        }

        boolean validTransition = switch (currentStatus) {
            case EN_ATTENTE -> newStatus == OrderStatus.EN_PREPARATION
                    || newStatus == OrderStatus.SERVIE;
            case EN_PREPARATION -> newStatus == OrderStatus.SERVIE;
            case SERVIE -> newStatus == OrderStatus.FACTUREE;
            case FACTUREE -> false;
            case ANNULEE -> false;
        };

        if (!validTransition) {
            throw new BadRequestException(
                    "Invalid order status transition from " + currentStatus + " to " + newStatus
            );
        }
    }

    private void updateTableStatusAfterOrderStatusChange(CustomerOrder order) {
        RestaurantTable table = order.getTable();

        if (OrderStatus.EN_ATTENTE.equals(order.getStatus())) {
            table.setStatus(TableStatus.EN_ATTENTE);
        }

        if (OrderStatus.EN_PREPARATION.equals(order.getStatus())) {
            table.setStatus(TableStatus.OCCUPEE);
        }

        if (OrderStatus.SERVIE.equals(order.getStatus())) {
            table.setStatus(TableStatus.OCCUPEE);
        }

        if (OrderStatus.FACTUREE.equals(order.getStatus())) {
            table.setStatus(TableStatus.LIBRE);
        }

        tableRepository.save(table);
    }

    private void validateServer(User server) {
        if (!server.isActive()) {
            throw new BadRequestException("Server is inactive");
        }

        if (!UserRole.SERVEUR.equals(server.getRole())) {
            throw new BadRequestException("User must have SERVEUR role");
        }
    }

    private CustomerOrder findOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    private RestaurantTable findTableById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
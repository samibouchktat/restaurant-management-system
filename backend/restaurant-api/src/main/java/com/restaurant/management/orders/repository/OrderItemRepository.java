package com.restaurant.management.orders.repository;

import com.restaurant.management.orders.entity.CustomerOrder;
import com.restaurant.management.orders.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(CustomerOrder order);
}
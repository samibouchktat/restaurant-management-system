package com.restaurant.management.orders.repository;

import com.restaurant.management.common.enums.OrderStatus;
import com.restaurant.management.orders.entity.CustomerOrder;
import com.restaurant.management.tables.entity.RestaurantTable;
import com.restaurant.management.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByStatusIn(List<OrderStatus> statuses);

    List<CustomerOrder> findByServer(User server);

    List<CustomerOrder> findByServerAndStatusIn(User server, List<OrderStatus> statuses);

    List<CustomerOrder> findByTable(RestaurantTable table);

    Optional<CustomerOrder> findFirstByTableAndStatusIn(
            RestaurantTable table,
            List<OrderStatus> statuses
    );
}
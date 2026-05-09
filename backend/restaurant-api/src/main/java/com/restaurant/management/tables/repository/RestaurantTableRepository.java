package com.restaurant.management.tables.repository;

import com.restaurant.management.tables.entity.RestaurantTable;
import com.restaurant.management.users.entity.User;
import com.restaurant.management.zones.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    Optional<RestaurantTable> findByTableNumberIgnoreCase(String tableNumber);

    boolean existsByTableNumberIgnoreCase(String tableNumber);

    List<RestaurantTable> findByZone(Zone zone);

    List<RestaurantTable> findByZoneAssignedServer(User assignedServer);
}
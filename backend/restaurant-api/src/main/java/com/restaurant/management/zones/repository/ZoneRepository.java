package com.restaurant.management.zones.repository;

import com.restaurant.management.zones.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ZoneRepository extends JpaRepository<Zone, Long> {

    Optional<Zone> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
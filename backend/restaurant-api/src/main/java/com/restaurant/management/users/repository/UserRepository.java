package com.restaurant.management.users.repository;

import com.restaurant.management.common.enums.UserRole;
import com.restaurant.management.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByInternalId(String internalId);

    boolean existsByInternalId(String internalId);

    long countByRole(UserRole role);
}
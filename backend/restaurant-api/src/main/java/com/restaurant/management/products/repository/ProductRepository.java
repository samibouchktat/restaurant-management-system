package com.restaurant.management.products.repository;

import com.restaurant.management.categories.entity.Category;
import com.restaurant.management.products.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Product> findByCategory(Category category);

    List<Product> findByCategoryAndActiveTrue(Category category);

    List<Product> findByActiveTrue();

    List<Product> findByActiveTrueAndAvailableTrue();

    List<Product> findByCategoryAndActiveTrueAndAvailableTrue(Category category);
}
package com.restaurant.management.products.service;

import com.restaurant.management.categories.entity.Category;
import com.restaurant.management.categories.repository.CategoryRepository;
import com.restaurant.management.common.exceptions.BadRequestException;
import com.restaurant.management.common.exceptions.ResourceNotFoundException;
import com.restaurant.management.products.dto.ProductResponse;
import com.restaurant.management.products.dto.PublicMenuCategoryResponse;
import com.restaurant.management.products.entity.Product;
import com.restaurant.management.products.mapper.ProductMapper;
import com.restaurant.management.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicMenuServiceImpl implements PublicMenuService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public List<PublicMenuCategoryResponse> getPublicMenu() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc()
                .stream()
                .map(this::toPublicMenuCategoryResponse)
                .filter(categoryResponse -> !categoryResponse.getProducts().isEmpty())
                .toList();
    }

    @Override
    public List<ProductResponse> getAvailableProductsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (!category.isActive()) {
            throw new BadRequestException("Category is inactive");
        }

        return productRepository.findByCategoryAndActiveTrueAndAvailableTrue(category)
                .stream()
                .sorted(Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER))
                .map(productMapper::toResponse)
                .toList();
    }

    private PublicMenuCategoryResponse toPublicMenuCategoryResponse(Category category) {
        List<ProductResponse> products = productRepository.findByCategoryAndActiveTrueAndAvailableTrue(category)
                .stream()
                .sorted(Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER))
                .map(productMapper::toResponse)
                .toList();

        return PublicMenuCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .displayOrder(category.getDisplayOrder())
                .products(products)
                .build();
    }
}
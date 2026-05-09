package com.restaurant.management.products.mapper;

import com.restaurant.management.categories.entity.Category;
import com.restaurant.management.products.dto.ProductCreateRequest;
import com.restaurant.management.products.dto.ProductResponse;
import com.restaurant.management.products.dto.ProductUpdateRequest;
import com.restaurant.management.products.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductCreateRequest request, Category category) {
        return Product.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .price(request.getPrice())
                .imageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null)
                .available(request.getAvailable() == null || request.getAvailable())
                .active(true)
                .category(category)
                .build();
    }

    public void updateEntity(Product product, ProductUpdateRequest request, Category category) {
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null);
        product.setAvailable(Boolean.TRUE.equals(request.getAvailable()));
        product.setCategory(category);
    }

    public ProductResponse toResponse(Product product) {
        Category category = product.getCategory();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .available(product.isAvailable())
                .active(product.isActive())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
package com.restaurant.management.categories.mapper;

import com.restaurant.management.categories.dto.CategoryCreateRequest;
import com.restaurant.management.categories.dto.CategoryResponse;
import com.restaurant.management.categories.dto.CategoryUpdateRequest;
import com.restaurant.management.categories.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryCreateRequest request) {
        return Category.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(true)
                .build();
    }

    public void updateEntity(Category category, CategoryUpdateRequest request) {
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
    }

    public CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.isActive())
                .displayOrder(category.getDisplayOrder())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
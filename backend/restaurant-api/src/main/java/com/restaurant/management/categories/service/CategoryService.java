package com.restaurant.management.categories.service;

import com.restaurant.management.categories.dto.CategoryCreateRequest;
import com.restaurant.management.categories.dto.CategoryResponse;
import com.restaurant.management.categories.dto.CategoryUpdateRequest;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryCreateRequest request);

    List<CategoryResponse> getAllCategories();

    List<CategoryResponse> getActiveCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse updateCategory(Long id, CategoryUpdateRequest request);

    CategoryResponse activateCategory(Long id);

    CategoryResponse deactivateCategory(Long id);
}
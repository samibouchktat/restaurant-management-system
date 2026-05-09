package com.restaurant.management.products.service;

import com.restaurant.management.products.dto.ProductResponse;
import com.restaurant.management.products.dto.PublicMenuCategoryResponse;

import java.util.List;

public interface PublicMenuService {

    List<PublicMenuCategoryResponse> getPublicMenu();

    List<ProductResponse> getAvailableProductsByCategory(Long categoryId);
}
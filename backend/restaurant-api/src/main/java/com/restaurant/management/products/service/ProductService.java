package com.restaurant.management.products.service;

import com.restaurant.management.products.dto.ProductCreateRequest;
import com.restaurant.management.products.dto.ProductResponse;
import com.restaurant.management.products.dto.ProductUpdateRequest;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductCreateRequest request);

    List<ProductResponse> getAllProducts();

    List<ProductResponse> getActiveProducts();

    List<ProductResponse> getAvailableProducts();

    List<ProductResponse> getProductsByCategory(Long categoryId);

    List<ProductResponse> getAvailableProductsByCategory(Long categoryId);

    ProductResponse getProductById(Long id);

    ProductResponse updateProduct(Long id, ProductUpdateRequest request);

    ProductResponse activateProduct(Long id);

    ProductResponse deactivateProduct(Long id);

    ProductResponse markProductAsAvailable(Long id);

    ProductResponse markProductAsUnavailable(Long id);
}
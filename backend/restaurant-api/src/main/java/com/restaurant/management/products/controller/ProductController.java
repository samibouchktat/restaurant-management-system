package com.restaurant.management.products.controller;

import com.restaurant.management.common.responses.ApiResponse;
import com.restaurant.management.products.dto.ProductCreateRequest;
import com.restaurant.management.products.dto.ProductResponse;
import com.restaurant.management.products.dto.ProductUpdateRequest;
import com.restaurant.management.products.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Gestion des produits du menu")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Créer un produit")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {
        ProductResponse response = productService.createProduct(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister tous les produits")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> response = productService.getAllProducts();

        return ResponseEntity.ok(
                ApiResponse.success("Products retrieved successfully", response)
        );
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister les produits actifs")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getActiveProducts() {
        List<ProductResponse> response = productService.getActiveProducts();

        return ResponseEntity.ok(
                ApiResponse.success("Active products retrieved successfully", response)
        );
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister les produits disponibles")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAvailableProducts() {
        List<ProductResponse> response = productService.getAvailableProducts();

        return ResponseEntity.ok(
                ApiResponse.success("Available products retrieved successfully", response)
        );
    }

    @GetMapping("/by-category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister les produits d'une catégorie")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByCategory(
            @PathVariable Long categoryId
    ) {
        List<ProductResponse> response = productService.getProductsByCategory(categoryId);

        return ResponseEntity.ok(
                ApiResponse.success("Products by category retrieved successfully", response)
        );
    }

    @GetMapping("/available/by-category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister les produits disponibles d'une catégorie")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAvailableProductsByCategory(
            @PathVariable Long categoryId
    ) {
        List<ProductResponse> response = productService.getAvailableProductsByCategory(categoryId);

        return ResponseEntity.ok(
                ApiResponse.success("Available products by category retrieved successfully", response)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Consulter un produit par ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @PathVariable Long id
    ) {
        ProductResponse response = productService.getProductById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Product retrieved successfully", response)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Modifier un produit")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        ProductResponse response = productService.updateProduct(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Product updated successfully", response)
        );
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Activer un produit")
    public ResponseEntity<ApiResponse<ProductResponse>> activateProduct(
            @PathVariable Long id
    ) {
        ProductResponse response = productService.activateProduct(id);

        return ResponseEntity.ok(
                ApiResponse.success("Product activated successfully", response)
        );
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Désactiver un produit")
    public ResponseEntity<ApiResponse<ProductResponse>> deactivateProduct(
            @PathVariable Long id
    ) {
        ProductResponse response = productService.deactivateProduct(id);

        return ResponseEntity.ok(
                ApiResponse.success("Product deactivated successfully", response)
        );
    }

    @PatchMapping("/{id}/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Rendre un produit disponible")
    public ResponseEntity<ApiResponse<ProductResponse>> markProductAsAvailable(
            @PathVariable Long id
    ) {
        ProductResponse response = productService.markProductAsAvailable(id);

        return ResponseEntity.ok(
                ApiResponse.success("Product marked as available successfully", response)
        );
    }

    @PatchMapping("/{id}/unavailable")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Rendre un produit indisponible")
    public ResponseEntity<ApiResponse<ProductResponse>> markProductAsUnavailable(
            @PathVariable Long id
    ) {
        ProductResponse response = productService.markProductAsUnavailable(id);

        return ResponseEntity.ok(
                ApiResponse.success("Product marked as unavailable successfully", response)
        );
    }
}
package com.restaurant.management.categories.controller;

import com.restaurant.management.categories.dto.CategoryCreateRequest;
import com.restaurant.management.categories.dto.CategoryResponse;
import com.restaurant.management.categories.dto.CategoryUpdateRequest;
import com.restaurant.management.categories.service.CategoryService;
import com.restaurant.management.common.responses.ApiResponse;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Gestion des catégories du menu")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Créer une catégorie")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        CategoryResponse response = categoryService.createCategory(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister toutes les catégories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> response = categoryService.getAllCategories();

        return ResponseEntity.ok(
                ApiResponse.success("Categories retrieved successfully", response)
        );
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister les catégories actives")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getActiveCategories() {
        List<CategoryResponse> response = categoryService.getActiveCategories();

        return ResponseEntity.ok(
                ApiResponse.success("Active categories retrieved successfully", response)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Consulter une catégorie par ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable Long id
    ) {
        CategoryResponse response = categoryService.getCategoryById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Category retrieved successfully", response)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Modifier une catégorie")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        CategoryResponse response = categoryService.updateCategory(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Category updated successfully", response)
        );
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Activer une catégorie")
    public ResponseEntity<ApiResponse<CategoryResponse>> activateCategory(
            @PathVariable Long id
    ) {
        CategoryResponse response = categoryService.activateCategory(id);

        return ResponseEntity.ok(
                ApiResponse.success("Category activated successfully", response)
        );
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Désactiver une catégorie")
    public ResponseEntity<ApiResponse<CategoryResponse>> deactivateCategory(
            @PathVariable Long id
    ) {
        CategoryResponse response = categoryService.deactivateCategory(id);

        return ResponseEntity.ok(
                ApiResponse.success("Category deactivated successfully", response)
        );
    }
}
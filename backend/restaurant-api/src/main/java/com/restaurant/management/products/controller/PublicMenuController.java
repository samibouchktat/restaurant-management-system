package com.restaurant.management.products.controller;

import com.restaurant.management.common.responses.ApiResponse;
import com.restaurant.management.products.dto.ProductResponse;
import com.restaurant.management.products.dto.PublicMenuCategoryResponse;
import com.restaurant.management.products.service.PublicMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/menu")
@RequiredArgsConstructor
@Tag(name = "Public Menu", description = "Menu public pour l'interface client QR")
public class PublicMenuController {

    private final PublicMenuService publicMenuService;

    @GetMapping
    @Operation(summary = "Consulter le menu public client QR")
    public ResponseEntity<ApiResponse<List<PublicMenuCategoryResponse>>> getPublicMenu() {
        List<PublicMenuCategoryResponse> response = publicMenuService.getPublicMenu();

        return ResponseEntity.ok(
                ApiResponse.success("Public menu retrieved successfully", response)
        );
    }

    @GetMapping("/categories/{categoryId}")
    @Operation(summary = "Consulter les produits disponibles d'une catégorie publique")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAvailableProductsByCategory(
            @PathVariable Long categoryId
    ) {
        List<ProductResponse> response = publicMenuService.getAvailableProductsByCategory(categoryId);

        return ResponseEntity.ok(
                ApiResponse.success("Public category products retrieved successfully", response)
        );
    }
}
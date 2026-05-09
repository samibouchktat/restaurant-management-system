package com.restaurant.management.orders.controller;

import com.restaurant.management.common.responses.ApiResponse;
import com.restaurant.management.orders.dto.CancelOrderRequest;
import com.restaurant.management.orders.dto.CreateQrOrderRequest;
import com.restaurant.management.orders.dto.CreateServerOrderRequest;
import com.restaurant.management.orders.dto.OrderResponse;
import com.restaurant.management.orders.dto.UpdateOrderRequest;
import com.restaurant.management.orders.dto.UpdateOrderStatusRequest;
import com.restaurant.management.orders.service.OrderService;
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
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Gestion des commandes")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/qr")
    @Operation(summary = "Créer une commande depuis l'interface client QR")
    public ResponseEntity<ApiResponse<OrderResponse>> createQrOrder(
            @Valid @RequestBody CreateQrOrderRequest request
    ) {
        OrderResponse response = orderService.createQrOrder(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("QR order created successfully", response));
    }

    @PostMapping("/server")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Créer une commande saisie par un serveur")
    public ResponseEntity<ApiResponse<OrderResponse>> createServerOrder(
            @Valid @RequestBody CreateServerOrderRequest request
    ) {
        OrderResponse response = orderService.createServerOrder(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Server order created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'CAISSIER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Lister toutes les commandes")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        List<OrderResponse> response = orderService.getAllOrders();

        return ResponseEntity.ok(
                ApiResponse.success("Orders retrieved successfully", response)
        );
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Lister les commandes actives")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveOrders() {
        List<OrderResponse> response = orderService.getActiveOrders();

        return ResponseEntity.ok(
                ApiResponse.success("Active orders retrieved successfully", response)
        );
    }

    @GetMapping("/by-server/{serverId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Lister les commandes d'un serveur")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByServer(
            @PathVariable Long serverId
    ) {
        List<OrderResponse> response = orderService.getOrdersByServer(serverId);

        return ResponseEntity.ok(
                ApiResponse.success("Orders by server retrieved successfully", response)
        );
    }

    @GetMapping("/by-server/{serverId}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Lister les commandes actives d'un serveur")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveOrdersByServer(
            @PathVariable Long serverId
    ) {
        List<OrderResponse> response = orderService.getActiveOrdersByServer(serverId);

        return ResponseEntity.ok(
                ApiResponse.success("Active orders by server retrieved successfully", response)
        );
    }

    @GetMapping("/by-table/{tableId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Lister les commandes d'une table")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByTable(
            @PathVariable Long tableId
    ) {
        List<OrderResponse> response = orderService.getOrdersByTable(tableId);

        return ResponseEntity.ok(
                ApiResponse.success("Orders by table retrieved successfully", response)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Consulter une commande par ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id
    ) {
        OrderResponse response = orderService.getOrderById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Order retrieved successfully", response)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Modifier les lignes d'une commande")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderRequest request
    ) {
        OrderResponse response = orderService.updateOrder(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Order updated successfully", response)
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Changer le statut d'une commande")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderResponse response = orderService.updateOrderStatus(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Order status updated successfully", response)
        );
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Annuler une commande avec motif")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @Valid @RequestBody CancelOrderRequest request
    ) {
        OrderResponse response = orderService.cancelOrder(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Order cancelled successfully", response)
        );
    }
}
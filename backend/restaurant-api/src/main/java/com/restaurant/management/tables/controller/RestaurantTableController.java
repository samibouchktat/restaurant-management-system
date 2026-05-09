package com.restaurant.management.tables.controller;

import com.restaurant.management.common.responses.ApiResponse;
import com.restaurant.management.tables.dto.TableCreateRequest;
import com.restaurant.management.tables.dto.TableResponse;
import com.restaurant.management.tables.dto.TableStatusUpdateRequest;
import com.restaurant.management.tables.dto.TableUpdateRequest;
import com.restaurant.management.tables.service.RestaurantTableService;
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
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@Tag(name = "Tables", description = "Gestion des tables de restaurant")
@SecurityRequirement(name = "bearerAuth")
public class RestaurantTableController {

    private final RestaurantTableService tableService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Créer une table")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(
            @Valid @RequestBody TableCreateRequest request
    ) {
        TableResponse response = tableService.createTable(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Table created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister toutes les tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables() {
        List<TableResponse> response = tableService.getAllTables();

        return ResponseEntity.ok(
                ApiResponse.success("Tables retrieved successfully", response)
        );
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister les tables actives")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getActiveTables() {
        List<TableResponse> response = tableService.getActiveTables();

        return ResponseEntity.ok(
                ApiResponse.success("Active tables retrieved successfully", response)
        );
    }

    @GetMapping("/floor-plan")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Consulter le plan de salle")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getFloorPlan() {
        List<TableResponse> response = tableService.getFloorPlan();

        return ResponseEntity.ok(
                ApiResponse.success("Floor plan retrieved successfully", response)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Consulter une table par ID")
    public ResponseEntity<ApiResponse<TableResponse>> getTableById(
            @PathVariable Long id
    ) {
        TableResponse response = tableService.getTableById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Table retrieved successfully", response)
        );
    }

    @GetMapping("/by-zone/{zoneId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister les tables d'une zone")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getTablesByZone(
            @PathVariable Long zoneId
    ) {
        List<TableResponse> response = tableService.getTablesByZone(zoneId);

        return ResponseEntity.ok(
                ApiResponse.success("Tables by zone retrieved successfully", response)
        );
    }

    @GetMapping("/by-server/{serverId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister les tables affectées à un serveur")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getTablesByServer(
            @PathVariable Long serverId
    ) {
        List<TableResponse> response = tableService.getTablesByServer(serverId);

        return ResponseEntity.ok(
                ApiResponse.success("Tables by server retrieved successfully", response)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Modifier une table")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableUpdateRequest request
    ) {
        TableResponse response = tableService.updateTable(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Table updated successfully", response)
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR')")
    @Operation(summary = "Modifier le statut d'une table")
    public ResponseEntity<ApiResponse<TableResponse>> updateTableStatus(
            @PathVariable Long id,
            @Valid @RequestBody TableStatusUpdateRequest request
    ) {
        TableResponse response = tableService.updateTableStatus(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Table status updated successfully", response)
        );
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Activer une table")
    public ResponseEntity<ApiResponse<TableResponse>> activateTable(
            @PathVariable Long id
    ) {
        TableResponse response = tableService.activateTable(id);

        return ResponseEntity.ok(
                ApiResponse.success("Table activated successfully", response)
        );
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Désactiver une table")
    public ResponseEntity<ApiResponse<TableResponse>> deactivateTable(
            @PathVariable Long id
    ) {
        TableResponse response = tableService.deactivateTable(id);

        return ResponseEntity.ok(
                ApiResponse.success("Table deactivated successfully", response)
        );
    }
}
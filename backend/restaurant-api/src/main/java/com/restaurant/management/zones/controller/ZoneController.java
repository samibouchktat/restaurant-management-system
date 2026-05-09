package com.restaurant.management.zones.controller;

import com.restaurant.management.common.responses.ApiResponse;
import com.restaurant.management.zones.dto.AssignServerRequest;
import com.restaurant.management.zones.dto.ZoneCreateRequest;
import com.restaurant.management.zones.dto.ZoneResponse;
import com.restaurant.management.zones.dto.ZoneUpdateRequest;
import com.restaurant.management.zones.service.ZoneService;
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
@RequestMapping("/api/zones")
@RequiredArgsConstructor
@Tag(name = "Zones", description = "Gestion des zones de salle")
@SecurityRequirement(name = "bearerAuth")
public class ZoneController {

    private final ZoneService zoneService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Créer une zone")
    public ResponseEntity<ApiResponse<ZoneResponse>> createZone(
            @Valid @RequestBody ZoneCreateRequest request
    ) {
        ZoneResponse response = zoneService.createZone(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Zone created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister toutes les zones")
    public ResponseEntity<ApiResponse<List<ZoneResponse>>> getAllZones() {
        List<ZoneResponse> response = zoneService.getAllZones();

        return ResponseEntity.ok(
                ApiResponse.success("Zones retrieved successfully", response)
        );
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Lister les zones actives")
    public ResponseEntity<ApiResponse<List<ZoneResponse>>> getActiveZones() {
        List<ZoneResponse> response = zoneService.getActiveZones();

        return ResponseEntity.ok(
                ApiResponse.success("Active zones retrieved successfully", response)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'SERVEUR', 'CAISSIER')")
    @Operation(summary = "Consulter une zone par ID")
    public ResponseEntity<ApiResponse<ZoneResponse>> getZoneById(
            @PathVariable Long id
    ) {
        ZoneResponse response = zoneService.getZoneById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Zone retrieved successfully", response)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Modifier une zone")
    public ResponseEntity<ApiResponse<ZoneResponse>> updateZone(
            @PathVariable Long id,
            @Valid @RequestBody ZoneUpdateRequest request
    ) {
        ZoneResponse response = zoneService.updateZone(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Zone updated successfully", response)
        );
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Activer une zone")
    public ResponseEntity<ApiResponse<ZoneResponse>> activateZone(
            @PathVariable Long id
    ) {
        ZoneResponse response = zoneService.activateZone(id);

        return ResponseEntity.ok(
                ApiResponse.success("Zone activated successfully", response)
        );
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Désactiver une zone")
    public ResponseEntity<ApiResponse<ZoneResponse>> deactivateZone(
            @PathVariable Long id
    ) {
        ZoneResponse response = zoneService.deactivateZone(id);

        return ResponseEntity.ok(
                ApiResponse.success("Zone deactivated successfully", response)
        );
    }

    @PatchMapping("/{id}/assign-server")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Affecter un serveur à une zone")
    public ResponseEntity<ApiResponse<ZoneResponse>> assignServerToZone(
            @PathVariable Long id,
            @Valid @RequestBody AssignServerRequest request
    ) {
        ZoneResponse response = zoneService.assignServerToZone(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Server assigned to zone successfully", response)
        );
    }

    @PatchMapping("/{id}/remove-server")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Retirer le serveur affecté à une zone")
    public ResponseEntity<ApiResponse<ZoneResponse>> removeAssignedServer(
            @PathVariable Long id
    ) {
        ZoneResponse response = zoneService.removeAssignedServer(id);

        return ResponseEntity.ok(
                ApiResponse.success("Assigned server removed successfully", response)
        );
    }
}
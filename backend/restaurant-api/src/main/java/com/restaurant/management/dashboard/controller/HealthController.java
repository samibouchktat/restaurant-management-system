package com.restaurant.management.dashboard.controller;

import com.restaurant.management.common.responses.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@Tag(name = "Health", description = "Endpoint de vérification de l'état de l'API")
public class HealthController {

    @GetMapping("/api/health")
    @Operation(summary = "Vérifier que l'API fonctionne correctement")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> data = Map.of(
                "status", "UP",
                "service", "restaurant-api",
                "timestamp", LocalDateTime.now()
        );

        return ResponseEntity.ok(
                ApiResponse.success("Restaurant API is running", data)
        );
    }
}
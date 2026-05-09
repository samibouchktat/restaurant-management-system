package com.restaurant.management.auth.controller;

import com.restaurant.management.auth.dto.ChangePasswordRequest;
import com.restaurant.management.auth.dto.LoginRequest;
import com.restaurant.management.auth.dto.LoginResponse;
import com.restaurant.management.auth.service.AuthService;
import com.restaurant.management.common.responses.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentification des comptes internes")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Connexion avec identifiant interne et mot de passe")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }

    @PostMapping("/change-password")
    @Operation(summary = "Modifier le mot de passe de l'utilisateur connecté")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(request);

        return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully")
        );
    }
}
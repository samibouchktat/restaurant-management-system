package com.restaurant.management.users.controller;

import com.restaurant.management.common.responses.ApiResponse;
import com.restaurant.management.users.dto.ResetPasswordRequest;
import com.restaurant.management.users.dto.UserCreateRequest;
import com.restaurant.management.users.dto.UserResponse;
import com.restaurant.management.users.dto.UserUpdateRequest;
import com.restaurant.management.users.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestion des comptes internes")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Créer un compte interne")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request
    ) {
        UserResponse response = userService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Lister tous les comptes internes")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> response = userService.getAllUsers();

        return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully", response)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter un compte interne par ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long id
    ) {
        UserResponse response = userService.getUserById(id);

        return ResponseEntity.ok(
                ApiResponse.success("User retrieved successfully", response)
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un compte interne")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        UserResponse response = userService.updateUser(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("User updated successfully", response)
        );
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activer un compte interne")
    public ResponseEntity<ApiResponse<UserResponse>> activateUser(
            @PathVariable Long id
    ) {
        UserResponse response = userService.activateUser(id);

        return ResponseEntity.ok(
                ApiResponse.success("User activated successfully", response)
        );
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Désactiver un compte interne")
    public ResponseEntity<ApiResponse<UserResponse>> deactivateUser(
            @PathVariable Long id
    ) {
        UserResponse response = userService.deactivateUser(id);

        return ResponseEntity.ok(
                ApiResponse.success("User deactivated successfully", response)
        );
    }

    @PatchMapping("/{id}/reset-password")
    @Operation(summary = "Réinitialiser le mot de passe d'un compte interne")
    public ResponseEntity<ApiResponse<UserResponse>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        UserResponse response = userService.resetPassword(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Password reset successfully", response)
        );
    }
}
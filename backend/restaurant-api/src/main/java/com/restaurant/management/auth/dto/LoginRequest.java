package com.restaurant.management.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Internal ID is required")
    private String internalId;

    @NotBlank(message = "Password is required")
    private String password;
}
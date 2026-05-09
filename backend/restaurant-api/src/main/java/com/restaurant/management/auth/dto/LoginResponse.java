package com.restaurant.management.auth.dto;

import com.restaurant.management.users.dto.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private String accessToken;
    private String tokenType;
    private long expiresInMs;
    private UserResponse user;
}
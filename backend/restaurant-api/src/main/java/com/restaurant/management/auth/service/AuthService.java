package com.restaurant.management.auth.service;

import com.restaurant.management.auth.dto.ChangePasswordRequest;
import com.restaurant.management.auth.dto.LoginRequest;
import com.restaurant.management.auth.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    void changePassword(ChangePasswordRequest request);
}
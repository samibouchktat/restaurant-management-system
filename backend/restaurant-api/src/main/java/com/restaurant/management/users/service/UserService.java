package com.restaurant.management.users.service;

import com.restaurant.management.users.dto.ResetPasswordRequest;
import com.restaurant.management.users.dto.UserCreateRequest;
import com.restaurant.management.users.dto.UserResponse;
import com.restaurant.management.users.dto.UserUpdateRequest;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    UserResponse activateUser(Long id);

    UserResponse deactivateUser(Long id);

    UserResponse resetPassword(Long id, ResetPasswordRequest request);
}
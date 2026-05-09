package com.restaurant.management.users.mapper;

import com.restaurant.management.users.dto.UserCreateRequest;
import com.restaurant.management.users.dto.UserResponse;
import com.restaurant.management.users.dto.UserUpdateRequest;
import com.restaurant.management.users.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserCreateRequest request, String internalId, String encodedPassword) {
        return User.builder()
                .internalId(internalId)
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(request.getRole())
                .password(encodedPassword)
                .active(true)
                .build();
    }

    public void updateEntity(User user, UserUpdateRequest request) {
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setRole(request.getRole());
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .internalId(user.getInternalId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
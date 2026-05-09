package com.restaurant.management.users.service;

import com.restaurant.management.common.enums.UserRole;
import com.restaurant.management.common.exceptions.BadRequestException;
import com.restaurant.management.common.exceptions.ResourceNotFoundException;
import com.restaurant.management.users.dto.ResetPasswordRequest;
import com.restaurant.management.users.dto.UserCreateRequest;
import com.restaurant.management.users.dto.UserResponse;
import com.restaurant.management.users.dto.UserUpdateRequest;
import com.restaurant.management.users.entity.User;
import com.restaurant.management.users.mapper.UserMapper;
import com.restaurant.management.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(UserCreateRequest request) {
        String internalId = generateInternalId(request.getRole());

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = userMapper.toEntity(request, internalId, encodedPassword);

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = findUserById(id);
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = findUserById(id);

        UserRole oldRole = user.getRole();
        UserRole newRole = request.getRole();

        userMapper.updateEntity(user, request);

        if (!oldRole.equals(newRole)) {
            user.setInternalId(generateInternalId(newRole));
        }

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Override
    public UserResponse activateUser(Long id) {
        User user = findUserById(id);

        if (user.isActive()) {
            throw new BadRequestException("User is already active");
        }

        user.setActive(true);

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Override
    public UserResponse deactivateUser(Long id) {
        User user = findUserById(id);

        if (!user.isActive()) {
            throw new BadRequestException("User is already inactive");
        }

        user.setActive(false);

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Override
    public UserResponse resetPassword(Long id, ResetPasswordRequest request) {
        User user = findUserById(id);

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());

        user.setPassword(encodedPassword);

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private String generateInternalId(UserRole role) {
        String prefix = getPrefixByRole(role);

        long count = userRepository.countByRole(role) + 1;

        String internalId;

        do {
            internalId = String.format("%s-%02d", prefix, count);
            count++;
        } while (userRepository.existsByInternalId(internalId));

        return internalId;
    }

    private String getPrefixByRole(UserRole role) {
        return switch (role) {
            case ADMIN -> "ADM";
            case GERANT -> "GER";
            case SERVEUR -> "SRV";
            case CAISSIER -> "CAIS";
        };
    }
}
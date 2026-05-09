package com.restaurant.management.auth.service;

import com.restaurant.management.auth.dto.ChangePasswordRequest;
import com.restaurant.management.auth.dto.LoginRequest;
import com.restaurant.management.auth.dto.LoginResponse;
import com.restaurant.management.common.exceptions.BadRequestException;
import com.restaurant.management.common.exceptions.ResourceNotFoundException;
import com.restaurant.management.security.JwtService;
import com.restaurant.management.users.entity.User;
import com.restaurant.management.users.mapper.UserMapper;
import com.restaurant.management.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getInternalId(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByInternalId(request.getInternalId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new DisabledException("User account is disabled");
        }

        String token = jwtService.generateToken(user);

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInMs(jwtService.getJwtExpirationMs())
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        String internalId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByInternalId(internalId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }
}
package com.restaurant.management.security;

import com.restaurant.management.users.entity.User;
import com.restaurant.management.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String internalId) throws UsernameNotFoundException {
        User user = userRepository.findByInternalId(internalId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with internal ID: " + internalId));

        if (!user.isActive()) {
            throw new DisabledException("User account is disabled");
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getInternalId())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.isActive())
                .build();
    }
}
package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.UserRequestDto;
import com.nexboard.nexboard.dto.UserResponseDto;
import com.nexboard.nexboard.entity.User;
import com.nexboard.nexboard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Create new user
    public UserResponseDto createUser(
            UserRequestDto requestDto) {
        log.info("Creating user: {}", requestDto.getUsername());

        User user = new User();

        // Set username
        user.setUsername(requestDto.getUsername());

        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(requestDto.getPassword()));

        // Assign role
        user.setRole(requestDto.getRole());

        User savedUser = userRepository.save(user);
        log.info("User created with ID: {}", savedUser.getId());

        return new UserResponseDto(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole()
        );
    }

    // Get all users
    public List<UserResponseDto> getAllUsers() {
        log.debug("Fetching all users");
        return userRepository.findAll()
                .stream()
                .map(user ->
                        new UserResponseDto(
                                user.getId(),
                                user.getUsername(),
                                user.getRole()
                        ))
                .toList();
    }
}
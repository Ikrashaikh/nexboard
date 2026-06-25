package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.UserRequestDto;
import com.nexboard.nexboard.dto.UserResponseDto;
import com.nexboard.nexboard.entity.User;
import com.nexboard.nexboard.repository.UserRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

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

        User user = new User();

        // Set username
        user.setUsername(requestDto.getUsername());

        // Encrypt password before saving
        String encodedPassword =
                passwordEncoder.encode(
                        requestDto.getPassword());

        System.out.println("Encoded Password: "
                + encodedPassword);

        user.setPassword(encodedPassword);

        // Assign role
        user.setRole(requestDto.getRole());

        User savedUser =
                userRepository.save(user);

        return new UserResponseDto(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole()
        );
    }

    // Get all users
    public List<UserResponseDto> getAllUsers() {

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
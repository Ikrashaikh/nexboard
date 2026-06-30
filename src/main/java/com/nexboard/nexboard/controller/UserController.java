package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.UserRequestDto;
import com.nexboard.nexboard.dto.UserResponseDto;
import com.nexboard.nexboard.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "Manage system users and roles (Admin only)")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Create a new system user")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDto createUser(
            @RequestBody UserRequestDto requestDto) {
        return userService.createUser(requestDto);
    }

    @Operation(summary = "Get all system users")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponseDto> getAllUsers() {
        return userService.getAllUsers();
    }
}

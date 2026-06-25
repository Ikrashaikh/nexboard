package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.UserRequestDto;
import com.nexboard.nexboard.dto.UserResponseDto;
import com.nexboard.nexboard.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService) {
        this.userService = userService;
    }

    // Create user
    @PostMapping
    public UserResponseDto createUser(
            @RequestBody UserRequestDto requestDto) {

        return userService.createUser(requestDto);
    }

    // Get all users
    @GetMapping
    public List<UserResponseDto> getAllUsers() {

        return userService.getAllUsers();
    }
}
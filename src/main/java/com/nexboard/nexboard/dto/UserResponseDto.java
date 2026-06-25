package com.nexboard.nexboard.dto;

import com.nexboard.nexboard.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserResponseDto {

    private Long id;

    private String username;

    private Role role;
}
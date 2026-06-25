package com.nexboard.nexboard.dto;

import com.nexboard.nexboard.enums.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequestDto {

    private String username;

    private String password;

    private Role role;
}
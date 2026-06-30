package com.nexboard.nexboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Login credentials")
public class LoginRequestDto {

    @NotBlank(message = "Username is required")
    @Schema(description = "Username", example = "admin")
    private String username;

    @NotBlank(message = "Password is required")
    @Schema(description = "Password", example = "admin123")
    private String password;
}

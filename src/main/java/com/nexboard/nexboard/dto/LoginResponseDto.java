package com.nexboard.nexboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "JWT token response after successful login")
public class LoginResponseDto {

    @Schema(description = "JWT access token")
    private String token;

    @Schema(description = "Token type", example = "Bearer")
    private String tokenType;

    @Schema(description = "Authenticated username")
    private String username;

    @Schema(description = "Role assigned to the user")
    private String role;
}

package com.nexboard.nexboard.controller;

import com.nexboard.nexboard.dto.LoginRequestDto;
import com.nexboard.nexboard.dto.LoginResponseDto;
import com.nexboard.nexboard.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Handles authentication — issues JWT tokens on successful login.
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Login and obtain a JWT token")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Operation(summary = "Login with username and password to receive a JWT token")
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @Valid @RequestBody LoginRequestDto request) {

        System.out.println(
            "LOGIN API HIT: "
                    + request.getUsername());
        log.info("Login attempt for user: {}", request.getUsername());

        // Authenticate — throws BadCredentialsException if invalid
        log.info("LOGIN REQUEST RECEIVED");
        log.info("Username: {}", request.getUsername());
        log.info("Password: {}", request.getPassword());
                
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String token = jwtService.generateToken(userDetails);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("");

        log.info("Login successful for user: {}", userDetails.getUsername());

        return ResponseEntity.ok(new LoginResponseDto(
                token,
                "Bearer",
                userDetails.getUsername(),
                role));
    }
}

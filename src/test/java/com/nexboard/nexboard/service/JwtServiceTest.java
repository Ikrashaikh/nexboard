package com.nexboard.nexboard.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Set values manually as they would be injected by Spring
        ReflectionTestUtils.setField(jwtService, "secret", "4e6f77566572795365637265744b6579466f724a575423323032354e657842");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 3600000L); // 1 hour
    }

    @Test
    void testTokenGenerationAndValidation() {
        UserDetails userDetails = new User("admin", "password", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        String token = jwtService.generateToken(userDetails);
        assertNotNull(token);

        String username = jwtService.extractUsername(token);
        assertEquals("admin", username);

        boolean isValid = jwtService.isTokenValid(token, userDetails);
        assertTrue(isValid);
    }
}

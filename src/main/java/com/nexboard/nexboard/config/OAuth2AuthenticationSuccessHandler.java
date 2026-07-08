package com.nexboard.nexboard.config;

import com.nexboard.nexboard.entity.User;
import com.nexboard.nexboard.enums.Role;
import com.nexboard.nexboard.repository.UserRepository;
import com.nexboard.nexboard.service.CustomUserDetailsService;
import com.nexboard.nexboard.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public OAuth2AuthenticationSuccessHandler(
            UserRepository userRepository,
            CustomUserDetailsService customUserDetailsService,
            JwtService jwtService,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null) {
            String login = oAuth2User.getAttribute("login");
            if (login == null) {
                login = oAuth2User.getName();
            }
            email = login + "@github.com";
        }

        String username = email;
        Optional<User> userOpt = userRepository.findByUsername(username);
        User user;

        if (userOpt.isEmpty()) {
            user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole(Role.EMPLOYEE);
            user = userRepository.save(user);
        } else {
            user = userOpt.get();
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("");

        String redirectUrl = String.format(
                "http://localhost:5173/oauth2/callback?token=%s&username=%s&role=%s",
                URLEncoder.encode(token, StandardCharsets.UTF_8),
                URLEncoder.encode(username, StandardCharsets.UTF_8),
                URLEncoder.encode(role, StandardCharsets.UTF_8)
        );

        response.sendRedirect(redirectUrl);
    }
}

package com.nexboard.nexboard.config;

import com.nexboard.nexboard.service.CustomUserDetailsService;
import com.nexboard.nexboard.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        log.info("[DEBUG] Authorization Header: {}", authHeader);
        log.info("[DEBUG] Current Server Time: {}", new java.util.Date());

        // Skip JWT validation for login APIs
        String requestPath = request.getServletPath();
        if (requestPath.startsWith("/auth")) {
            log.info("[DEBUG] Skipping JWT Filter - Auth path: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        // No token present (case-insensitive check for Bearer prefix)
        if (authHeader == null
                || !authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            log.info("[DEBUG] Skipping JWT Filter - No Bearer token header found");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = authHeader.substring(7).trim();
            // Remove surrounding double quotes if present
            if (jwt.startsWith("\"") && jwt.endsWith("\"")) {
                jwt = jwt.substring(1, jwt.length() - 1);
            }
            log.info("[DEBUG] Extracted JWT: {}", jwt);

            final String username = jwtService.extractUsername(jwt);
            log.info("[DEBUG] Extracted Username from JWT: {}", username);

            if (username != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(username);

                if (jwtService.isTokenValid(
                        jwt,
                        userDetails)) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request));

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);

                    log.info("[DEBUG] Successfully authenticated user: {}", username);
                } else {
                    log.warn("[DEBUG] Token validation failed in filter for user: {}", username);
                }
            }

        } catch (Exception e) {
            log.error("[DEBUG] JWT authentication failed: {}", e.getMessage());
            if (e instanceof io.jsonwebtoken.ExpiredJwtException) {
                io.jsonwebtoken.ExpiredJwtException expiredEx = (io.jsonwebtoken.ExpiredJwtException) e;
                log.info("[DEBUG] Expired JWT details -> iat={}, exp={}, subject={}", 
                        expiredEx.getClaims().getIssuedAt(), 
                        expiredEx.getClaims().getExpiration(), 
                        expiredEx.getClaims().getSubject());
            }
        }

        filterChain.doFilter(
                request,
                response);
    }
}

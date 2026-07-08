package com.nexboard.nexboard.config;

import com.nexboard.nexboard.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CorsConfigurationSource corsConfigurationSource;
    private final OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    private final BCryptPasswordEncoder passwordEncoder;
    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            CorsConfigurationSource corsConfigurationSource,
            OAuth2AuthenticationSuccessHandler oauth2SuccessHandler,
            BCryptPasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.corsConfigurationSource = corsConfigurationSource;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
        this.passwordEncoder = passwordEncoder;
    }

  /*  @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
*/
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                        // Public — login + Swagger
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // Protected by role
                        .requestMatchers("/users/**").hasRole("ADMIN")
                        .requestMatchers("/departments/**").hasAnyRole("ADMIN", "HR")
                        .requestMatchers("/employees/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/dashboard/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/analytics/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/reports/audit").hasAnyRole("ADMIN", "HR")
                        .requestMatchers("/reports/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/escalations/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/notifications/employee/**", "/notifications/*/read").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                        .requestMatchers("/notifications/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/employee-documents/*/verification").hasAnyRole("ADMIN", "HR")
                        .requestMatchers("/employee-documents/**").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                        .requestMatchers("/approval-workflows/*/decision").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/approval-workflows/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                        .requestMatchers("/employee-timelines/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                        .requestMatchers("/workflow-templates/progress/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                        .requestMatchers("/workflow-templates/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/tasks/overdue", "/tasks/analytics/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/tasks/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                        .requestMatchers("/audit-logs/**").hasAnyRole("ADMIN", "HR")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oauth2SuccessHandler)
                        .authorizationEndpoint(authorization -> authorization
                                .baseUri("/oauth2/authorize"))
                        .redirectionEndpoint(redirection -> redirection
                                .baseUri("/login/oauth2/code/*"))
                )
                // Register JWT filter before Spring's username/password filter
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

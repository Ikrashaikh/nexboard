package com.nexboard.nexboard.config;

import com.nexboard.nexboard.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .authenticationProvider(authenticationProvider())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
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
                        .requestMatchers("/employee-documents/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
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
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

}

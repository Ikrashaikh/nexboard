package com.nexboard.nexboard.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/**").hasRole("ADMIN")
                        .requestMatchers("/departments/**").hasAnyRole("ADMIN", "HR")
                        .requestMatchers("/employees/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/dashboard/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                        .requestMatchers("/analytics/**").hasAnyRole("ADMIN", "HR", "MANAGER")
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

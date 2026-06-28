package com.nexboard.nexboard.entity;

import com.nexboard.nexboard.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Login username
    @column(unique = true,nullable = false)
    private String username;

    // Encoded password
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
}
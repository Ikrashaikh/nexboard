package com.nexboard.nexboard.service;

import com.nexboard.nexboard.dto.UserRequestDto;
import com.nexboard.nexboard.dto.UserResponseDto;
import com.nexboard.nexboard.entity.User;
import com.nexboard.nexboard.enums.Role;
import com.nexboard.nexboard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setPassword("$2a$10$hashedpassword");
        adminUser.setRole(Role.ADMIN);
    }

    @Test
    void createUser_shouldEncodePasswordAndSave() {
        UserRequestDto requestDto = new UserRequestDto();
        requestDto.setUsername("admin");
        requestDto.setPassword("admin123");
        requestDto.setRole(Role.ADMIN);

        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(adminUser);

        UserResponseDto result = userService.createUser(requestDto);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("admin");
        assertThat(result.getRole()).isEqualTo(Role.ADMIN);

        verify(passwordEncoder, times(1)).encode("admin123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void getAllUsers_shouldReturnAllUsers() {
        User hrUser = new User();
        hrUser.setId(2L);
        hrUser.setUsername("hr");
        hrUser.setRole(Role.HR);

        when(userRepository.findAll()).thenReturn(List.of(adminUser, hrUser));

        List<UserResponseDto> result = userService.getAllUsers();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getUsername()).isEqualTo("admin");
        assertThat(result.get(1).getUsername()).isEqualTo("hr");
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void getAllUsers_shouldReturnEmptyList_whenNoUsersExist() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<UserResponseDto> result = userService.getAllUsers();

        assertThat(result).isEmpty();
    }
}

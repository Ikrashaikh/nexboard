package com.nexboard.nexboard.config;

import com.nexboard.nexboard.entity.User;
import com.nexboard.nexboard.enums.Role;
import com.nexboard.nexboard.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Data seeder that initializes default users on application startup if the database is empty.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("No users found in database. Seeding default accounts...");

            // Seed Admin
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

            // Seed HR
            User hr = new User();
            hr.setUsername("hr");
            hr.setPassword(passwordEncoder.encode("hr123"));
            hr.setRole(Role.HR);
            userRepository.save(hr);

            // Seed Manager
            User manager = new User();
            manager.setUsername("manager");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setRole(Role.MANAGER);
            userRepository.save(manager);

            // Seed Employee
            User employee = new User();
            employee.setUsername("employee");
            employee.setPassword(passwordEncoder.encode("employee123"));
            employee.setRole(Role.EMPLOYEE);
            userRepository.save(employee);

            System.out.println("Default users successfully seeded!");
        } else {
            System.out.println("Users already present in the database. Skipping default seeding.");
        }
    }
}

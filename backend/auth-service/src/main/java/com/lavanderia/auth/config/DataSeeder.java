package com.lavanderia.auth.config;

import com.lavanderia.auth.model.Role;
import com.lavanderia.auth.model.UserEntity;
import com.lavanderia.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${seed.admin.username:admin}")
    private String adminUsername;
    @Value("${seed.admin.email:admin@lavanderia.com}")
    private String adminEmail;
    @Value("${seed.admin.password:admin123}")
    private String adminPassword;

    @Value("${seed.user.username:user}")
    private String userUsername;
    @Value("${seed.user.email:user@lavanderia.com}")
    private String userEmail;
    @Value("${seed.user.password:user123}")
    private String userPassword;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername(adminUsername)) {
            userRepository.save(UserEntity.builder()
                    .username(adminUsername)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build());
            log.info("Usuario ADMIN seed creado: {}", adminUsername);
        }
        if (!userRepository.existsByUsername(userUsername)) {
            userRepository.save(UserEntity.builder()
                    .username(userUsername)
                    .email(userEmail)
                    .password(passwordEncoder.encode(userPassword))
                    .role(Role.USER)
                    .build());
            log.info("Usuario USER seed creado: {}", userUsername);
        }
    }
}

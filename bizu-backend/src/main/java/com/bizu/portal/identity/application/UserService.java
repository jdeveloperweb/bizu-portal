package com.bizu.portal.identity.application;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.KeycloakService;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    @Transactional
    public User registerUser(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Este e-mail já está cadastrado.");
        }
        
        // Primeiro cria no Keycloak
        keycloakService.createKeycloakUser(name, email, password);
        
        User user = User.builder()
                .name(name)
                .email(email)
                .status("ACTIVE")
                .build();
        
        return userRepository.save(user);
    }
}

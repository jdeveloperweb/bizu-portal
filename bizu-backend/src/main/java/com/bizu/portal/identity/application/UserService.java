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

    @Transactional
    public void deleteUser(java.util.UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Remove do Keycloak primeiro
        keycloakService.deleteKeycloakUser(user.getEmail());
        
        // Remove do banco local (hard delete para ser definitivo conforme pedido)
        userRepository.delete(user);
    }

    @Transactional
    public User syncUser(java.util.UUID userId, String email, String name) {
        return userRepository.findById(userId).orElseGet(() -> {
            User newUser = User.builder()
                    .id(userId)
                    .email(email)
                    .name(name != null ? name : email)
                    .status("ACTIVE")
                    .build();
            return userRepository.save(newUser);
        });
    }
}

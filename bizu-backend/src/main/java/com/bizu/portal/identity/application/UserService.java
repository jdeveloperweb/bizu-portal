package com.bizu.portal.identity.application;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.KeycloakService;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
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
    public User updateUser(java.util.UUID id, String name, String email) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        String oldEmail = user.getEmail();
        String oldName = user.getName();
        
        user.setName(name);
        user.setEmail(email);

        // Atualiza no Keycloak se necessário
        if (!name.equals(oldName) || !email.equals(oldEmail)) {
            keycloakService.updateKeycloakUser(oldEmail, name, email);
        }

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

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User syncUser(java.util.UUID userId, String email, String name) {
        // Try to find by ID first
        return userRepository.findById(userId).orElseGet(() -> {
            // If not found by ID, try to find by email
            return userRepository.findByEmail(email).map(existingUser -> {
                // If found by email, we should ideally link the IDs, 
                // but for now returning the existing user is safer.
                return existingUser;
            }).orElseGet(() -> {
                // Create new user with Keycloak subject ID
                User newUser = User.builder()
                        .id(userId)
                        .email(email)
                        .name(name != null ? name : email)
                        .status("ACTIVE")
                        .build();
                
                try {
                    return userRepository.saveAndFlush(newUser);
                } catch (Exception ex) {
                    // Fallback to finding by email if a race condition occurred
                    return userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("Erro ao sincronizar usuário", ex));
                }
            });
        });
    }

    @Transactional
    public java.util.UUID resolveUserId(org.springframework.security.oauth2.jwt.Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        java.util.UUID subjectId = java.util.UUID.fromString(jwt.getSubject());
        
        // Ensure user exists locally and return its ID
        return syncUser(subjectId, email, name).getId();
    }
}

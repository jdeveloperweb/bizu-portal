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
        return userRepository.findById(userId).orElseGet(() -> {
            User newUser = User.builder()
                    .id(userId)
                    .email(email)
                    .name(name != null ? name : email)
                    .status("ACTIVE")
                    .build();
            
            // User IDs come from the identity provider.
            // Using setNew(false) forces merge(), which is safer for potential concurrent inserts
            // as it will pick up the existing record if it was inserted between find and save.
            newUser.setNew(false);
            try {
                return userRepository.saveAndFlush(newUser);
            } catch (Exception ex) {
                // If it fails (OptimisticLocking, DataIntegrity, etc.), 
                // it means another thread likely already persisted the user.
                return userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("Erro ao sincronizar usuário", ex));
            }
        });
    }
}

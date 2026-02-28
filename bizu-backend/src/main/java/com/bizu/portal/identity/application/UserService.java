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

    public java.util.Optional<User> findById(java.util.UUID id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User registerUser(String name, String email, String password, String phone) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Este e-mail já está cadastrado.");
        }
        
        // Primeiro cria no Keycloak
        keycloakService.createKeycloakUser(name, email, password);
        
        String nickname = generateNickname(email);

        User user = User.builder()
                .id(java.util.UUID.randomUUID())
                .name(name)
                .email(email)
                .phone(phone)
                .nickname(nickname)
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
        User user = userRepository.findById(userId).orElseGet(() -> {
            return userRepository.findByEmail(email).orElseGet(() -> {
                String generatedNickname = generateNickname(email);
                User newUser = User.builder()
                        .id(userId)
                        .email(email)
                        .nickname(generatedNickname)
                        .name(name != null ? name : email)
                        .status("ACTIVE")
                        .build();
                
                try {
                    return userRepository.save(newUser);
                } catch (Exception ex) {
                    return userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("Erro ao criar usuário localmente: " + email, ex));
                }
            });
        });

        // Atualiza a presença sem incrementar o version
        try {
            userRepository.updateLastSeen(user.getId());
        } catch (Exception e) {
            // Se falhar o update de presença, não derruba o request principal
        }
        
        return user;
    }

    @Transactional
    public java.util.UUID resolveUserId(org.springframework.security.oauth2.jwt.Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null) email = jwt.getClaimAsString("preferred_username");
        if (email == null) email = jwt.getSubject(); // Fallback final

        String name = jwt.getClaimAsString("name");
        if (name == null) name = jwt.getClaimAsString("preferred_username");
        if (name == null) name = email;
        
        String sub = jwt.getSubject();
        java.util.UUID subjectId;
        try {
            subjectId = java.util.UUID.fromString(sub);
        } catch (Exception e) {
            subjectId = java.util.UUID.nameUUIDFromBytes(email.getBytes());
        }
        
        return syncUser(subjectId, email, name).getId();
    }

    private String generateNickname(String email) {
        if (email == null || !email.contains("@")) {
            return "user_" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        if (base.isEmpty()) {
            base = "user";
        }
        String randomSuffix = java.util.UUID.randomUUID().toString().substring(0, 4);
        return base + "_" + randomSuffix;
    }
}

package com.bizu.portal.identity.application;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.domain.Role;
import com.bizu.portal.identity.infrastructure.KeycloakService;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.identity.infrastructure.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
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
    public User updateUser(java.util.UUID id, String name, String email, String phone) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        String oldEmail = user.getEmail();
        String oldName = user.getName();
        
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);

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
        
        // Proteção: Impede a exclusão de usuários com e-mail de administrador ou role ADMIN
        boolean isAdmin = user.getEmail().toLowerCase().contains("admin") || 
                         user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));

        if (isAdmin) {
            throw new RuntimeException("Não é permitido excluir usuários administradores do sistema.");
        }
        
        // Remove do banco local primeiro
        userRepository.delete(user);

        // Remove do Keycloak depois
        keycloakService.deleteKeycloakUser(user.getEmail());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User syncUser(java.util.UUID userId, String email, String name, Set<String> roles) {
        String effectiveEmail = email != null ? email : userId.toString() + "@internal.bizu.com.br";
        String effectiveName = name != null ? name : (email != null ? email : "User " + userId.toString().substring(0, 8));

        User user = userRepository.findById(userId).orElseGet(() -> {
            return userRepository.findByEmail(effectiveEmail).orElseGet(() -> {
                String generatedNickname = generateNickname(effectiveEmail);
                User newUser = User.builder()
                        .id(userId)
                        .email(effectiveEmail)
                        .nickname(generatedNickname)
                        .name(effectiveName)
                        .status("ACTIVE")
                        .build();
                
                try {
                    return userRepository.save(newUser);
                } catch (Exception ex) {
                    return userRepository.findByEmail(effectiveEmail)
                            .orElseThrow(() -> new RuntimeException("Erro ao criar usuário localmente: " + effectiveEmail, ex));
                }
            });
        });

        // Sync roles if provided
        if (roles != null && !roles.isEmpty()) {
            boolean changed = false;
            for (String roleName : roles) {
                String normalizedRole = roleName.toUpperCase();
                if (user.getRoles().stream().noneMatch(r -> r.getName().equals(normalizedRole))) {
                    Role role = roleRepository.findByName(normalizedRole)
                            .orElseGet(() -> roleRepository.save(Role.builder().name(normalizedRole).build()));
                    user.getRoles().add(role);
                    changed = true;
                }
            }
            if (changed) {
                userRepository.save(user);
            }
        }

        // Atualiza a presença sem incrementar o version
        try {
            userRepository.updateLastSeen(user.getId());
        } catch (Exception e) {
            // Se falhar o update de presença, não derruba o request principal
        }
        
        return user;
    }

    @Transactional
    public User resolveUser(org.springframework.security.oauth2.jwt.Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null) email = jwt.getClaimAsString("preferred_username");
        if (email == null) email = jwt.getSubject();

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
        
        // Extract roles from JWT
        Set<String> roles = new java.util.HashSet<>();
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.get("roles") instanceof java.util.List) {
            java.util.List<String> keycloakRoles = (java.util.List<String>) realmAccess.get("roles");
            roles.addAll(keycloakRoles);
        }
        
        return syncUser(subjectId, email, name, roles);
    }

    @Transactional
    public java.util.UUID resolveUserId(org.springframework.security.oauth2.jwt.Jwt jwt) {
        return resolveUser(jwt).getId();
    }

    public void forgotPassword(String email) {
        keycloakService.forgotPassword(email);
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

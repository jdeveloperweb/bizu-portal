package com.bizu.portal.admin.api;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.domain.GamificationStats;
import com.bizu.portal.student.infrastructure.GamificationRepository;
import com.bizu.portal.identity.application.UserService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final GamificationRepository gamificationRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<AdminUserDto>> listUsers() {
        List<User> users = userRepository.findAll();
        
        // Otimização: Busca todos os stats de uma vez para evitar N+1 queries
        Map<UUID, GamificationStats> statsMap = gamificationRepository.findAll().stream()
                .collect(Collectors.toMap(GamificationStats::getUserId, s -> s, (s1, s2) -> s1));

        List<AdminUserDto> dtos = users.stream()
                .map(user -> toDto(user, statsMap.get(user.getId())))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(UUID.fromString(id));
        return ResponseEntity.noContent().build();
    }

    private AdminUserDto toDto(User user, GamificationStats stats) {
        String xp = "0";
        if (stats != null && stats.getTotalXp() != null) {
            int totalXp = stats.getTotalXp();
            if (totalXp >= 1000) {
                xp = String.format("%.1fk", totalXp / 1000.0).replace(".0k", "k");
            } else {
                xp = String.valueOf(totalXp);
            }
        }

        return AdminUserDto.builder()
                .id(user.getId().toString())
                .name(user.getName() != null ? user.getName() : "Sem Nome")
                .email(user.getEmail() != null ? user.getEmail() : "")
                .status(user.getStatus() != null ? user.getStatus() : "ACTIVE")
                .plan("FREE") 
                .joined(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "")
                .xp(xp)
                .build();
    }

    @Data
    @Builder
    public static class AdminUserDto {
        private String id;
        private String name;
        private String email;
        private String status;
        private String plan;
        private String joined;
        private String xp;
    }
}

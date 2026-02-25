package com.bizu.portal.admin.api;

import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.commerce.domain.Subscription;
import com.bizu.portal.commerce.infrastructure.PlanRepository;
import com.bizu.portal.commerce.infrastructure.SubscriptionRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.domain.GamificationStats;
import com.bizu.portal.student.infrastructure.GamificationRepository;
import com.bizu.portal.identity.application.UserService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
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
    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;

    @GetMapping
    public ResponseEntity<List<AdminUserDto>> listUsers() {
        List<User> users = userRepository.findAll();
        
        // Otimização: Busca todos os stats e assinaturas de uma vez
        Map<UUID, GamificationStats> statsMap = gamificationRepository.findAll().stream()
                .collect(Collectors.toMap(GamificationStats::getUserId, s -> s, (s1, s2) -> s1));

        Map<UUID, Subscription> subsMap = subscriptionRepository.findAllByStatus("ACTIVE").stream()
                .collect(Collectors.toMap(s -> s.getUser().getId(), s -> s, (s1, s2) -> s1));

        List<AdminUserDto> dtos = users.stream()
                .map(user -> toDto(user, statsMap.get(user.getId()), subsMap.get(user.getId())))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDto> getUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        GamificationStats stats = gamificationRepository.findByUserId(id).orElse(null);
        Subscription sub = subscriptionRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(id, "ACTIVE").orElse(null);
        
        return ResponseEntity.ok(toDto(user, stats, sub));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody UserUpdateDto updateDto) {
        User user = userService.updateUser(id, updateDto.getName(), updateDto.getEmail());
        
        if (updateDto.getPlanId() != null) {
            Plan plan = planRepository.findById(UUID.fromString(updateDto.getPlanId()))
                .orElseThrow(() -> new RuntimeException("Plano não encontrado"));
            
            // Cancela assinaturas anteriores
            subscriptionRepository.findAllByStatus("ACTIVE").stream()
                .filter(s -> s.getUser().getId().equals(id))
                .forEach(s -> {
                    s.setStatus("CANCELED");
                    subscriptionRepository.save(s);
                });
            
            // Cria nova assinatura
            Subscription sub = Subscription.builder()
                .user(user)
                .plan(plan)
                .status("ACTIVE")
                .currentPeriodStart(java.time.OffsetDateTime.now())
                .currentPeriodEnd(java.time.OffsetDateTime.now().plusYears(1)) // Prático: 1 ano
                .build();
            subscriptionRepository.save(sub);
        }
        
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(UUID.fromString(id));
        return ResponseEntity.noContent().build();
    }

    private AdminUserDto toDto(User user, GamificationStats stats, Subscription sub) {
        String xp = "0";
        if (stats != null && stats.getTotalXp() != null) {
            int totalXp = stats.getTotalXp();
            if (totalXp >= 1000) {
                xp = String.format("%.1fk", totalXp / 1000.0).replace(".0k", "k");
            } else {
                xp = String.valueOf(totalXp);
            }
        }

        String planName = "FREE";
        String planId = null;
        String courseTitle = "Nenhum";
        
        if (sub != null && sub.getPlan() != null) {
            planName = sub.getPlan().getName();
            planId = sub.getPlan().getId().toString();
            if (sub.getPlan().getCourse() != null) {
                courseTitle = sub.getPlan().getCourse().getTitle();
            }
        }

        return AdminUserDto.builder()
                .id(user.getId().toString())
                .name(user.getName() != null ? user.getName() : "Sem Nome")
                .email(user.getEmail() != null ? user.getEmail() : "")
                .status(user.getStatus() != null ? user.getStatus() : "ACTIVE")
                .plan(planName)
                .planId(planId)
                .courseTitle(courseTitle)
                .joined(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "")
                .xp(xp)
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserUpdateDto {
        private String name;
        private String email;
        private String planId;
    }

    @Data
    @Builder
    public static class AdminUserDto {
        private String id;
        private String name;
        private String email;
        private String status;
        private String plan;
        private String planId;
        private String courseTitle;
        private String joined;
        private String xp;
    }
}

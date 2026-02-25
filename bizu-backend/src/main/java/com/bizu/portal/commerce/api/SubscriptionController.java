package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.domain.Subscription;
import com.bizu.portal.commerce.infrastructure.SubscriptionRepository;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<Subscription> getMySubscription(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        return userRepository.findByEmail(email)
            .flatMap(user -> subscriptionRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), "ACTIVE"))
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

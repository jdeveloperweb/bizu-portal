package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.AxonStoreService;
import com.bizu.portal.student.domain.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/store")
@RequiredArgsConstructor
public class AxonStoreController {

    private final AxonStoreService axonStoreService;
    private final UserService userService;
    private final com.bizu.portal.commerce.application.PaymentService paymentService;
    private final com.bizu.portal.commerce.infrastructure.PlanRepository planRepository;
    private final com.bizu.portal.identity.infrastructure.UserRepository userRepository;

    @GetMapping("/inventory")
    public ResponseEntity<List<Inventory>> getInventory(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(axonStoreService.getInventory(userId));
    }

    @PostMapping("/buy")
    public ResponseEntity<?> buyItem(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        UUID userId = userService.resolveUserId(jwt);
        String itemCode = (String) body.get("itemCode");
        int price = (int) body.get("price");

        try {
            axonStoreService.buyItem(userId, itemCode, price);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/use")
    public ResponseEntity<?> useItem(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> body) {
        UUID userId = userService.resolveUserId(jwt);
        String itemCode = body.get("itemCode");
        try {
            axonStoreService.useItem(userId, itemCode);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutPack(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> body) {
        UUID userId = userService.resolveUserId(jwt);
        String packCode = body.get("packCode");
        
        com.bizu.portal.commerce.domain.Plan plan = planRepository.findByCode(packCode)
                .orElseThrow(() -> new RuntimeException("Pacote não encontrado: " + packCode));
        
        com.bizu.portal.identity.domain.User user = userRepository.getReferenceById(userId);
        
        java.util.Map<String, Object> result = paymentService.initiatePayment(
                user, 
                plan.getPrice(), 
                "AUTO", // Use preferred gateway
                "PIX",  // Default method for quick coins
                plan.getId()
        );
        
        return ResponseEntity.ok(result);
    }
}

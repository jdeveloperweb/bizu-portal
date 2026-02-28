package com.bizu.portal.student.application;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.domain.GamificationStats;
import com.bizu.portal.student.domain.Inventory;
import com.bizu.portal.student.infrastructure.GamificationRepository;
import com.bizu.portal.student.infrastructure.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AxonStoreService {

    private final InventoryRepository inventoryRepository;
    private final GamificationRepository gamificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void buyItem(UUID userId, String itemCode, int price) {
        GamificationStats stats = gamificationRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Stats not found"));

        if (stats.getAxonCoins() < price) {
            throw new RuntimeException("Axons insuficientes");
        }

        stats.setAxonCoins(stats.getAxonCoins() - price);
        gamificationRepository.save(stats);

        addItemToInventory(userId, itemCode, 1);
    }

    @Transactional
    public void addItemToInventory(UUID userId, String itemCode, int quantity) {
        User user = userRepository.getReferenceById(userId);
        Optional<Inventory> existing = inventoryRepository.findByUserIdAndItemCode(userId, itemCode);

        if (existing.isPresent()) {
            Inventory inv = existing.get();
            inv.setQuantity(inv.getQuantity() + quantity);
            inventoryRepository.save(inv);
        } else {
            Inventory inv = Inventory.builder()
                    .user(user)
                    .itemCode(itemCode)
                    .quantity(quantity)
                    .createdAt(OffsetDateTime.now())
                    .build();
            inventoryRepository.save(inv);
        }
    }

    public List<Inventory> getInventory(UUID userId) {
        return inventoryRepository.findAllByUserId(userId);
    }

    @Transactional
    public GamificationStats addAxons(UUID userId, int amount) {
        GamificationStats stats = gamificationRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Stats not found"));
        
        stats.setAxonCoins((stats.getAxonCoins() != null ? stats.getAxonCoins() : 0) + amount);
        return gamificationRepository.save(stats);
    }
}

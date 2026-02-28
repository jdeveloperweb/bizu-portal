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

    @Transactional
    public void useItem(UUID userId, String itemCode) {
        Inventory inventory = inventoryRepository.findByUserIdAndItemCode(userId, itemCode)
                .orElseThrow(() -> new RuntimeException("Item não encontrado no seu inventário"));

        if (inventory.getQuantity() <= 0) {
            throw new RuntimeException("Quantidade insuficiente deste item");
        }

        GamificationStats stats = gamificationRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Stats não encontrados"));

        OffsetDateTime now = OffsetDateTime.now();

        switch (itemCode) {
            case "DOUBLE_XP_2H":
                OffsetDateTime currentBoost = stats.getXpBoostUntil();
                OffsetDateTime baseTime = (currentBoost != null && currentBoost.isAfter(now)) ? currentBoost : now;
                stats.setXpBoostUntil(baseTime.plusHours(2));
                break;
            case "RADAR_MATERIA_24H":
                stats.setRadarMateriaUntil(now.plusDays(1));
                // Lógica de qual matéria será definida no front ou via subtipo, por enquanto fixamos uma ou deixamos pra definir
                break;
            case "STATUS_ELITE":
                stats.setActiveTitle("Elite");
                break;
            case "STREAK_FREEZE":
                throw new RuntimeException("O Escudo de Ofensiva é ativado AUTOMATICAMENTE quando você falha na streak!");
            default:
                throw new RuntimeException("Este item não pode ser ativado manualmente.");
        }

        // Consumir o item (exceto itens permanentes se houver, mas aqui todos são consumíveis exceto título que pode ser ativado várias vezes?)
        // Vamos consumir todos que dão boost temporário
        if (!itemCode.startsWith("STATUS_")) {
            inventory.setQuantity(inventory.getQuantity() - 1);
            if (inventory.getQuantity() == 0) {
                inventoryRepository.delete(inventory);
            } else {
                inventoryRepository.save(inventory);
            }
        }

        gamificationRepository.save(stats);
    }
}

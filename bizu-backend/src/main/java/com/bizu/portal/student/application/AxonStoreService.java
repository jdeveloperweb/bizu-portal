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
    private final com.bizu.portal.student.infrastructure.StoreItemRepository storeItemRepository;

    @Transactional
    public void buyItem(UUID userId, String itemCode) {
        com.bizu.portal.student.domain.StoreItem item = storeItemRepository.findByCode(itemCode)
                .orElseThrow(() -> new RuntimeException("Item não encontrado: " + itemCode));

        GamificationStats stats = gamificationRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Stats not found"));

        if (stats.getAxonCoins() < item.getPrice()) {
            throw new RuntimeException("Axons insuficientes");
        }

        stats.setAxonCoins(stats.getAxonCoins() - item.getPrice());
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

    public List<com.bizu.portal.student.domain.StoreItem> getActiveStoreItems() {
        return storeItemRepository.findAllByActiveTrue();
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

        if (itemCode.startsWith("STATUS_")) {
            String titleValue = itemCode.replace("STATUS_", "");
            // Mapeamento de nomes amigáveis para títulos hardcoded
            String title = "MASTER".equals(titleValue) ? "Mestre" :
                         "LEGEND".equals(titleValue) ? "Lenda" :
                         "ELITE".equals(titleValue) ? "Elite" : titleValue;
            stats.setActiveTitle(title.equals(stats.getActiveTitle()) ? null : title);
        } else if (itemCode.startsWith("AURA_")) {
            String aura = itemCode.replace("AURA_", "");
            stats.setActiveAura(aura.equals(stats.getActiveAura()) ? null : aura);
        } else if (itemCode.startsWith("BORDER_")) {
            String border = itemCode.replace("BORDER_", "");
            stats.setActiveBorder(border.equals(stats.getActiveBorder()) ? null : border);
        } else {
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
                case "STREAK_FREEZE":
                    // Escudo é passivo, mas permitimos "ativar" para feedback visual no front
                    break;
                default:
                    throw new RuntimeException("Este item não pode ser ativado manualmente.");
            }
        }

        // Itens de STATUS (Títulos), Auras e Borders são permanentes e não são consumidos
        boolean isPermanent = itemCode.startsWith("STATUS_") || itemCode.startsWith("AURA_") || itemCode.startsWith("BORDER_");
        if (!isPermanent) {
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

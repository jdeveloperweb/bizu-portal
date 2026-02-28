package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    List<Inventory> findAllByUserId(UUID userId);
    Optional<Inventory> findByUserIdAndItemCode(UUID userId, String itemCode);
}

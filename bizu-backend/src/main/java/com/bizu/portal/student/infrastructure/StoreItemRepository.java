package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.StoreItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoreItemRepository extends JpaRepository<StoreItem, UUID> {
    Optional<StoreItem> findByCode(String code);
    List<StoreItem> findAllByActiveTrue();
}

package com.bizu.portal.admin.api;

import com.bizu.portal.student.domain.StoreItem;
import com.bizu.portal.student.infrastructure.StoreItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/store/items")
@RequiredArgsConstructor
public class AdminStoreController {

    private final StoreItemRepository storeItemRepository;

    @GetMapping
    public ResponseEntity<List<StoreItem>> getAllItems() {
        return ResponseEntity.ok(storeItemRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<StoreItem> createItem(@RequestBody StoreItem item) {
        return ResponseEntity.ok(storeItemRepository.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoreItem> updateItem(@PathVariable UUID id, @RequestBody StoreItem itemDetails) {
        StoreItem item = storeItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        item.setName(itemDetails.getName());
        item.setDescription(itemDetails.getDescription());
        item.setPrice(itemDetails.getPrice());
        item.setCategory(itemDetails.getCategory());
        item.setActive(itemDetails.isActive());
        
        return ResponseEntity.ok(storeItemRepository.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable UUID id) {
        storeItemRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

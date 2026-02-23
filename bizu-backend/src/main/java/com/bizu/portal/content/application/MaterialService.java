package com.bizu.portal.content.application;

import com.bizu.portal.content.domain.Material;
import com.bizu.portal.content.infrastructure.MaterialRepository;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;

    public List<Material> findByModuleId(UUID moduleId) {
        return materialRepository.findByModuleId(moduleId);
    }

    public Material findById(UUID id) {
        return materialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado"));
    }

    @Transactional
    public Material save(Material material) {
        return materialRepository.save(material);
    }

    @Transactional
    public void delete(UUID id) {
        Material material = findById(id);
        materialRepository.delete(material);
    }
}

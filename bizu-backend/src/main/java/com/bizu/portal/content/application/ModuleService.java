package com.bizu.portal.content.application;

import com.bizu.portal.content.domain.Module;
import com.bizu.portal.content.infrastructure.ModuleRepository;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;

    public List<Module> findByCourseId(UUID courseId) {
        return moduleRepository.findByCourse_IdOrderByOrderIndexAsc(courseId);
    }

    public Module findById(UUID id) {
        return moduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Módulo não encontrado"));
    }

    @Transactional
    public Module save(Module module) {
        return moduleRepository.save(module);
    }

    @Transactional
    public void delete(UUID id) {
        Module module = findById(id);
        moduleRepository.delete(module);
    }
}

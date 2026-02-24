package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {
    List<Module> findByCourse_IdOrderByOrderIndexAsc(UUID courseId);
}

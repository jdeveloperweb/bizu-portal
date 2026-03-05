package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.Quest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface QuestRepository extends JpaRepository<Quest, UUID> {
}

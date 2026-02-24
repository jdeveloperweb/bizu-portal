package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByUserIdOrderByPinnedDescUpdatedAtDesc(UUID userId);
}

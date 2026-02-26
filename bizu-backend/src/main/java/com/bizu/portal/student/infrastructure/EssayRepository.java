package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.Essay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EssayRepository extends JpaRepository<Essay, UUID> {
    List<Essay> findByStudentId(UUID studentId);
    List<Essay> findByStudentIdAndCourseId(UUID studentId, UUID courseId);
}

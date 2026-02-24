package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.StudentTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentTaskRepository extends JpaRepository<StudentTask, UUID> {
    List<StudentTask> findAllByStudentIdOrderByCreatedAtDesc(UUID studentId);
}

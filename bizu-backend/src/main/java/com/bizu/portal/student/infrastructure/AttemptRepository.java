package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, UUID> {

    List<Attempt> findAllByUser_Id(UUID userId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT a.question.id) FROM Attempt a WHERE a.user.id = :userId AND a.question.module.course.id = :courseId")
    long countDistinctQuestionByUserIdAndCourseId(UUID userId, UUID courseId);
}

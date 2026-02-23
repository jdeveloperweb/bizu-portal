package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
    
    @Query("SELECT q FROM Question q WHERE " +
           "(:banca IS NULL OR q.banca = :banca) AND " +
           "(:year IS NULL OR q.year = :year) AND " +
           "(:subject IS NULL OR q.subject = :subject) AND " +
           "(:topic IS NULL OR q.topic = :topic) AND " +
           "(:difficulty IS NULL OR q.difficulty = :difficulty)")
    Page<Question> findByFilters(
        @Param("banca") String banca,
        @Param("year") Integer year,
        @Param("subject") String subject,
        @Param("topic") String topic,
        @Param("difficulty") String difficulty,
        Pageable pageable
    );
}

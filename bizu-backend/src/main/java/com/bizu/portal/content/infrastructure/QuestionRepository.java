package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
    
    @Query("SELECT q FROM Question q WHERE " +
           "(:banca IS NULL OR q.banca = :banca) AND " +
           "(:year IS NULL OR q.year = :year) AND " +
           "(:subject IS NULL OR q.subject = :subject) AND " +
           "(:topic IS NULL OR q.topic = :topic) AND " +
           "(:difficulty IS NULL OR q.difficulty = :difficulty) AND " +
           "(:category IS NULL OR q.category = :category)")
    Page<Question> findByFilters(
        @Param("banca") String banca,
        @Param("year") Integer year,
        @Param("subject") String subject,
        @Param("topic") String topic,
        @Param("difficulty") String difficulty,
        @Param("category") String category,
        Pageable pageable
    );

    @Query("SELECT q FROM Question q WHERE q.category = :category AND " +
           "(LOWER(q.statement) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.topic) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.banca) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Question> searchByCategory(
        @Param("category") String category,
        @Param("search") String search,
        Pageable pageable
    );

    Page<Question> findByCategory(String category, Pageable pageable);

    @Query(value = "SELECT * FROM content.questions WHERE category = :category ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    java.util.List<Question> findRandomByCategory(@Param("category") String category, @Param("limit") int limit);

    @Query(value = "SELECT * FROM content.questions WHERE module_id = :moduleId AND category = :category ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    java.util.List<Question> findRandomByModuleAndCategory(@Param("moduleId") UUID moduleId, @Param("category") String category, @Param("limit") int limit);

    @Query(value = "SELECT * FROM content.questions WHERE module_id IN (:moduleIds) AND category = :category ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    java.util.List<Question> findRandomByModulesAndCategory(@Param("moduleIds") java.util.List<UUID> moduleIds, @Param("category") String category, @Param("limit") int limit);

    long countByCategory(String category);

    long countByCategoryAndDifficulty(String category, String difficulty);

    @Query("SELECT DISTINCT q.subject FROM Question q WHERE q.category = :category")
    java.util.List<String> findDistinctSubjectsByCategory(@Param("category") String category);

    @Query("SELECT DISTINCT q.banca FROM Question q WHERE q.category = :category AND q.banca IS NOT NULL")
    java.util.List<String> findDistinctBancasByCategory(@Param("category") String category);

    @Transactional
    void deleteByModule_Id(UUID moduleId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM student.duel_questions WHERE question_id IN (SELECT id FROM content.questions WHERE UPPER(topic) = UPPER(:topic))", nativeQuery = true)
    void deleteDuelQuestionsByTopic(@Param("topic") String topic);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM student.attempts WHERE question_id IN (SELECT id FROM content.questions WHERE UPPER(topic) = UPPER(:topic))", nativeQuery = true)
    void deleteAttemptsByTopic(@Param("topic") String topic);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM content.simulado_questions WHERE question_id IN (SELECT id FROM content.questions WHERE UPPER(topic) = UPPER(:topic))", nativeQuery = true)
    void deleteSimuladoQuestionsByTopic(@Param("topic") String topic);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM student.duel_questions WHERE question_id IN (SELECT id FROM content.questions WHERE UPPER(subject) = UPPER(:subject))", nativeQuery = true)
    void deleteDuelQuestionsBySubject(@Param("subject") String subject);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM student.attempts WHERE question_id IN (SELECT id FROM content.questions WHERE UPPER(subject) = UPPER(:subject))", nativeQuery = true)
    void deleteAttemptsBySubject(@Param("subject") String subject);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM content.simulado_questions WHERE question_id IN (SELECT id FROM content.questions WHERE UPPER(subject) = UPPER(:subject))", nativeQuery = true)
    void deleteSimuladoQuestionsBySubject(@Param("subject") String subject);

    @Modifying
    @Transactional
    @Query("DELETE FROM Question q WHERE UPPER(q.topic) = UPPER(:topic)")
    void deleteByTopic(@Param("topic") String topic);

    @Modifying
    @Transactional
    @Query("DELETE FROM Question q WHERE UPPER(q.subject) = UPPER(:subject)")
    void deleteBySubject(@Param("subject") String subject);
}

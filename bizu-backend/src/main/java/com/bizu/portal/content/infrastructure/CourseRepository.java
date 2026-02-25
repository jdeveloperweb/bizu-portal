package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c LEFT JOIN FETCH c.modules m LEFT JOIN FETCH m.materials WHERE c.id = :id")
    java.util.Optional<Course> findByIdWithModules(@org.springframework.data.repository.query.Param("id") UUID id);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.modules m LEFT JOIN FETCH m.questions WHERE c.id = :id")
    java.util.Optional<Course> findByIdWithModulesAndQuestions(@org.springframework.data.repository.query.Param("id") UUID id);
}

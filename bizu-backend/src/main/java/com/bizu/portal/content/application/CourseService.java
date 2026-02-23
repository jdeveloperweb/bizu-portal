package com.bizu.portal.content.application;

import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<Course> findAll() {
        return courseRepository.findAll();
    }

    public Course findById(UUID id) {
        return courseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado"));
    }

    @Transactional
    public Course save(Course course) {
        return courseRepository.save(course);
    }
}

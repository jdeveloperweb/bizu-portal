package com.bizu.portal.content.application;

import com.bizu.portal.commerce.application.EntitlementService;
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
    private final EntitlementService entitlementService;

    public List<Course> findAll() {
        List<Course> courses = courseRepository.findAll();
        courses.forEach(this::populateStudentsCount);
        return courses;
    }

    @Transactional(readOnly = true)
    public Course findById(UUID id) {
        Course course = courseRepository.findByIdWithModules(id)
            .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado"));
        populateStudentsCount(course);
        return course;
    }

    private void populateStudentsCount(Course course) {
        if (course != null && course.getId() != null) {
            course.setStudentsCount(entitlementService.countStudentsByCourse(course.getId()));
        }
    }

    @Transactional
    public Course save(Course course) {
        return courseRepository.save(course);
    }

    @Transactional
    public void delete(UUID id) {
        Course course = findById(id);
        courseRepository.delete(course);
    }
}

package com.bizu.portal.content.api;

import com.bizu.portal.content.application.CourseService;
import com.bizu.portal.content.domain.Course;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final CourseService courseService;

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.save(course));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable UUID id, @RequestBody Course course) {
        Course existing = courseService.findById(id);
        existing.setTitle(course.getTitle());
        existing.setDescription(course.getDescription());
        existing.setThemeColor(course.getThemeColor());
        existing.setTextColor(course.getTextColor());
        existing.setStatus(course.getStatus());
        existing.setThumbnailUrl(course.getThumbnailUrl());
        existing.setCategory(course.getCategory());
        existing.setLevel(course.getLevel());
        existing.setMandatory(course.isMandatory());
        return ResponseEntity.ok(courseService.save(existing));
    }

    @GetMapping
    public ResponseEntity<java.util.List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable UUID id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

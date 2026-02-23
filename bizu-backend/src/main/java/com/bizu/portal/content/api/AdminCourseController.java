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
        course.setId(existing.getId());
        return ResponseEntity.ok(courseService.save(course));
    }
}

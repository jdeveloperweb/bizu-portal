package com.bizu.portal.content.api;

import com.bizu.portal.content.api.dto.PublicCourseDTO;
import com.bizu.portal.content.api.dto.PublicCourseSlimDTO;
import com.bizu.portal.content.application.CourseService;
import com.bizu.portal.content.domain.Course;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public/courses")
@RequiredArgsConstructor
public class PublicCourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<PublicCourseSlimDTO>> getAllCourses() {
        return ResponseEntity.ok(courseService.findAllPublic().stream()
                .map(PublicCourseSlimDTO::fromEntity)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicCourseDTO> getCourseById(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        Course course;
        if (jwt != null) {
            course = courseService.findById(id);
        } else {
            course = courseService.findPublicById(id);
        }
        return ResponseEntity.ok(PublicCourseDTO.fromEntity(course));
    }
}

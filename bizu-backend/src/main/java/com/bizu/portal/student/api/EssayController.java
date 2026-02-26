package com.bizu.portal.student.api;

import com.bizu.portal.student.application.EssayService;
import com.bizu.portal.student.application.SubmitEssayRequest;
import com.bizu.portal.student.domain.Essay;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/essays")
@RequiredArgsConstructor
public class EssayController {

    private final EssayService essayService;

    @GetMapping
    public ResponseEntity<List<Essay>> getMyEssays(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) UUID courseId) {
        UUID studentId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(essayService.getStudentEssays(studentId, courseId));
    }

    @PostMapping
    public ResponseEntity<Essay> submitEssay(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody SubmitEssayRequest request) {
        UUID studentId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(essayService.submitEssay(studentId, request));
    }
}

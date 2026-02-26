package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.EssayService;
import com.bizu.portal.student.application.SubmitEssayRequest;
import com.bizu.portal.student.domain.Essay;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/essays")
@RequiredArgsConstructor
public class EssayController {

    private final EssayService essayService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Essay>> getMyEssays(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) UUID courseId) {
        UUID studentId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(essayService.getStudentEssays(studentId, courseId));
    }

    @PostMapping
    public ResponseEntity<Essay> submitEssay(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody SubmitEssayRequest request) {
        UUID studentId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(essayService.submitEssay(studentId, request));
    }

    @PostMapping("/extract-text")
    public ResponseEntity<Map<String, String>> extractText(@RequestBody Map<String, String> request) {
        String imageUrl = request.get("imageUrl");
        if (imageUrl == null || imageUrl.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String text = essayService.extractText(imageUrl);
        return ResponseEntity.ok(Map.of("text", text));
    }

    @DeleteMapping("/{essayId}")
    public ResponseEntity<Void> deleteEssay(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID essayId) {
        UUID studentId = userService.resolveUserId(jwt);
        essayService.deleteEssay(studentId, essayId);
        return ResponseEntity.noContent().build();
    }
}

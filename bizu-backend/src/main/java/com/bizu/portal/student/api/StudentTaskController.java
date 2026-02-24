package com.bizu.portal.student.api;

import com.bizu.portal.student.application.CreateStudentTaskDTO;
import com.bizu.portal.student.application.StudentTaskDTO;
import com.bizu.portal.student.application.StudentTaskService;
import com.bizu.portal.student.application.UpdateStudentTaskStatusDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/tasks")
@RequiredArgsConstructor
public class StudentTaskController {

    private final StudentTaskService studentTaskService;

    @GetMapping
    public ResponseEntity<List<StudentTaskDTO>> getUserTasks(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(studentTaskService.getUserTasks(userId));
    }

    @PostMapping
    public ResponseEntity<StudentTaskDTO> createTask(@AuthenticationPrincipal Jwt jwt, @RequestBody CreateStudentTaskDTO createDTO) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(studentTaskService.createTask(userId, createDTO));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Void> updateTaskStatus(@PathVariable UUID taskId, @AuthenticationPrincipal Jwt jwt, @RequestBody UpdateStudentTaskStatusDTO dto) {
        UUID userId = UUID.fromString(jwt.getSubject());
        studentTaskService.updateTaskStatus(taskId, userId, dto.getStatus());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        studentTaskService.deleteTask(taskId, userId);
        return ResponseEntity.noContent().build();
    }
}

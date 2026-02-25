package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.CreateStudentTaskDTO;
import com.bizu.portal.student.application.StudentTaskDTO;
import com.bizu.portal.student.application.StudentTaskService;
import com.bizu.portal.student.application.UpdateStudentTaskStatusDTO;
import com.bizu.portal.student.application.TaskSuggestionDTO;
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
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<StudentTaskDTO>> getUserTasks(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        syncUser(jwt, UUID.fromString(jwt.getSubject()));
        return ResponseEntity.ok(studentTaskService.getUserTasks(userId));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<TaskSuggestionDTO>> getSuggestions(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        syncUser(jwt, UUID.fromString(jwt.getSubject()));
        return ResponseEntity.ok(studentTaskService.generateSuggestions(userId));
    }

    @PostMapping
    public ResponseEntity<StudentTaskDTO> createTask(@AuthenticationPrincipal Jwt jwt, @RequestBody CreateStudentTaskDTO createDTO) {
        UUID userId = userService.resolveUserId(jwt);
        syncUser(jwt, UUID.fromString(jwt.getSubject()));
        return ResponseEntity.ok(studentTaskService.createTask(userId, createDTO));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Void> updateTaskStatus(@PathVariable UUID taskId, @AuthenticationPrincipal Jwt jwt, @RequestBody UpdateStudentTaskStatusDTO dto) {
        UUID userId = userService.resolveUserId(jwt);
        syncUser(jwt, UUID.fromString(jwt.getSubject()));
        studentTaskService.updateTaskStatus(taskId, userId, dto.getStatus());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        syncUser(jwt, UUID.fromString(jwt.getSubject()));
        studentTaskService.deleteTask(taskId, userId);
        return ResponseEntity.noContent().build();
    }

    private void syncUser(Jwt jwt, UUID userId) {
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        userService.syncUser(userId, email, name);
    }
}

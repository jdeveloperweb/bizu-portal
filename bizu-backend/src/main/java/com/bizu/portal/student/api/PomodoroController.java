package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.application.PomodoroService;
import com.bizu.portal.student.application.PomodoroSessionDTO;
import com.bizu.portal.student.application.PomodoroSessionRequest;
import com.bizu.portal.student.application.PomodoroSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/student/pomodoro")
@RequiredArgsConstructor
public class PomodoroController {

    private final PomodoroService pomodoroService;
    private final UserService userService;

    @GetMapping("/summary")
    public ResponseEntity<PomodoroSummaryDTO> getSummary(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.resolveUser(jwt);
        return ResponseEntity.ok(pomodoroService.getSummary(user));
    }

    @PostMapping("/session")
    public ResponseEntity<PomodoroSessionDTO> saveSession(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody PomodoroSessionRequest request) {
        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.resolveUser(jwt);
        return ResponseEntity.ok(pomodoroService.saveSession(user, request));
    }
}

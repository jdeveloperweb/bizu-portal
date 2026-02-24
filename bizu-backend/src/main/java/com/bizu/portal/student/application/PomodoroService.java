package com.bizu.portal.student.application;

import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.domain.PomodoroSession;
import com.bizu.portal.student.infrastructure.PomodoroSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PomodoroService {

    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public PomodoroSummaryDTO getSummary(User user) {
        OffsetDateTime startOfDay = OffsetDateTime.now().truncatedTo(ChronoUnit.DAYS);
        OffsetDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);

        List<PomodoroSession> todaySessions = pomodoroSessionRepository.findByUserIdAndCompletedAtBetweenOrderByCompletedAtDesc(
                user.getId(), startOfDay, endOfDay);

        Integer totalFocusToday = todaySessions.stream().mapToInt(PomodoroSession::getFocusMinutes).sum();
        Integer completedCycles = todaySessions.stream().mapToInt(PomodoroSession::getCycles).sum();

        List<PomodoroSession> recentSessions = pomodoroSessionRepository.findByUserIdOrderByCompletedAtDesc(user.getId())
                .stream()
                .limit(10) // Get the last 10 sessions
                .collect(Collectors.toList());

        List<PomodoroSessionDTO> recentSessionsDTOs = recentSessions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return PomodoroSummaryDTO.builder()
                .totalFocusToday(totalFocusToday)
                .completedCycles(completedCycles)
                .recentSessions(recentSessionsDTOs)
                .build();
    }

    @Transactional
    public PomodoroSessionDTO saveSession(User user, PomodoroSessionRequest request) {
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId()).orElse(null);
        }

        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .course(course)
                .subject(request.getSubject())
                .focusMinutes(request.getFocusMinutes())
                .cycles(request.getCycles())
                .completedAt(OffsetDateTime.now())
                .build();

        PomodoroSession savedSession = pomodoroSessionRepository.save(session);
        return mapToDTO(savedSession);
    }

    private PomodoroSessionDTO mapToDTO(PomodoroSession session) {
        return PomodoroSessionDTO.builder()
                .id(session.getId())
                .subject(session.getSubject())
                .focusMinutes(session.getFocusMinutes())
                .cycles(session.getCycles())
                .completedAt(formatRelativeTime(session.getCompletedAt()))
                .build();
    }

    private String formatRelativeTime(OffsetDateTime completedAt) {
        OffsetDateTime now = OffsetDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(completedAt, now);
        if (minutes < 60) {
            return "Há " + minutes + " min";
        }
        long hours = ChronoUnit.HOURS.between(completedAt, now);
        if (hours < 24) {
            return "Há " + hours + "h";
        }
        long days = ChronoUnit.DAYS.between(completedAt, now);
        if (days == 1) {
            return "Ontem";
        }
        return "Há " + days + " dias";
    }
}

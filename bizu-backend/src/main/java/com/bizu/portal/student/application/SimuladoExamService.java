package com.bizu.portal.student.application;

import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.content.infrastructure.SimuladoRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import com.bizu.portal.student.domain.SimuladoResult;
import com.bizu.portal.student.domain.SimuladoSession;
import com.bizu.portal.student.infrastructure.SimuladoResultRepository;
import com.bizu.portal.student.infrastructure.SimuladoSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SimuladoExamService {

    private final SimuladoRepository simuladoRepository;
    private final SimuladoSessionRepository sessionRepository;
    private final SimuladoResultRepository resultRepository;
    private final UserRepository userRepository;

    /** Default session window if simulado has no durationMinutes configured */
    private static final int DEFAULT_DURATION_MINUTES = 240;

    // ─────────────────────────────────────────────────────────────────────────
    // DTOs (inner records)
    // ─────────────────────────────────────────────────────────────────────────

    public record QuestionExamDTO(
            UUID id,
            String statement,
            Map<String, String> options,
            String banca,
            Integer year,
            String subject,
            String imageBase64
    ) {}

    public record SessionStartDTO(
            UUID sessionId,
            OffsetDateTime startedAt,
            OffsetDateTime expiresAt,
            Integer durationMinutes,
            String simuladoTitle,
            List<QuestionExamDTO> questions
    ) {}

    public record QuestionResultDTO(
            UUID questionId,
            String statement,
            String correctOption,
            String userAnswer,
            boolean correct,
            String resolution
    ) {}

    public record ExamResultDTO(
            UUID sessionId,
            String status,
            int score,
            int totalQuestions,
            double scorePercent,
            OffsetDateTime startedAt,
            OffsetDateTime submittedAt,
            List<QuestionResultDTO> questionResults
    ) {}

    public record SimuladoListItemDTO(
            UUID id,
            String title,
            String description,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            Integer durationMinutes,
            int questionCount,
            String courseId,
            String courseTitle,
            String courseThemeColor,
            String courseTextColor,
            String sessionStatus,
            Integer sessionScore,
            Integer sessionTotalQuestions,
            String availability
    ) {}

    // ─────────────────────────────────────────────────────────────────────────
    // Start Exam
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public SessionStartDTO startExam(UUID userId, UUID simuladoId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Simulado simulado = simuladoRepository.findById(simuladoId)
                .orElseThrow(() -> new ResourceNotFoundException("Simulado not found"));

        // Force-load questions within transaction
        simulado.getQuestions().size();

        // Check availability: simulado must have dates and be within range
        OffsetDateTime now = OffsetDateTime.now();
        if (simulado.getStartDate() == null || simulado.getEndDate() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Este simulado ainda não está disponível.");
        }
        if (now.isBefore(simulado.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Este simulado ainda não está disponível. Aguarde a data de início.");
        }
        if (now.isAfter(simulado.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "O período deste simulado já encerrou.");
        }

        // Enforce single-attempt rule
        sessionRepository.findByUser_IdAndSimulado_Id(userId, simuladoId).ifPresent(existing -> {
            // If still IN_PROGRESS but user is trying to restart → they abandoned it → cancel it
            if ("IN_PROGRESS".equals(existing.getStatus())) {
                existing.setStatus(now.isAfter(existing.getExpiresAt()) ? "EXPIRED" : "CANCELLED");
                existing.setSubmittedAt(now);
                sessionRepository.save(existing);
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Você já realizou este simulado. Status: " + existing.getStatus());
        });

        // Calculate expiry
        int duration = simulado.getDurationMinutes() != null
                ? simulado.getDurationMinutes()
                : DEFAULT_DURATION_MINUTES;
        OffsetDateTime expiresAt = now.plusMinutes(duration);

        SimuladoSession session = SimuladoSession.builder()
                .user(user)
                .simulado(simulado)
                .startedAt(now)
                .expiresAt(expiresAt)
                .status("IN_PROGRESS")
                .build();
        session = sessionRepository.save(session);

        List<QuestionExamDTO> questions = simulado.getQuestions().stream()
                .map(this::toExamDTO)
                .collect(Collectors.toList());

        return new SessionStartDTO(
                session.getId(),
                session.getStartedAt(),
                session.getExpiresAt(),
                simulado.getDurationMinutes(),
                simulado.getTitle(),
                questions
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Submit Exam
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public ExamResultDTO submitExam(UUID userId, UUID simuladoId, Map<String, String> answers) {
        SimuladoSession session = sessionRepository.findByUser_IdAndSimulado_Id(userId, simuladoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Nenhuma sessão ativa encontrada para este simulado."));

        if (!"IN_PROGRESS".equals(session.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Este simulado já foi finalizado. Status: " + session.getStatus());
        }

        // Check expiry
        OffsetDateTime now = OffsetDateTime.now();
        if (now.isAfter(session.getExpiresAt())) {
            session.setStatus("EXPIRED");
            session.setSubmittedAt(now);
            sessionRepository.save(session);
            throw new ResponseStatusException(HttpStatus.GONE,
                    "O tempo do simulado esgotou.");
        }

        // Load simulado + questions
        Simulado simulado = simuladoRepository.findById(simuladoId)
                .orElseThrow(() -> new ResourceNotFoundException("Simulado not found"));
        simulado.getQuestions().size();

        List<Question> questions = simulado.getQuestions();
        int total = questions.size();
        int score = 0;

        List<QuestionResultDTO> results = questions.stream().map(q -> {
            String qId = q.getId().toString();
            String userAnswer = answers.getOrDefault(qId, null);
            boolean correct = q.getCorrectOption() != null && q.getCorrectOption().equals(userAnswer);
            return new QuestionResultDTO(
                    q.getId(),
                    q.getStatement(),
                    q.getCorrectOption(),
                    userAnswer,
                    correct,
                    q.getResolution()
            );
        }).collect(Collectors.toList());

        long correctCount = results.stream().filter(QuestionResultDTO::correct).count();

        // Update session
        session.setAnswers(answers != null ? new HashMap<>(answers) : new HashMap<>());
        session.setScore((int) correctCount);
        session.setTotalQuestions(total);
        session.setStatus("COMPLETED");
        session.setSubmittedAt(now);
        sessionRepository.save(session);

        // Save SimuladoResult for ranking
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        SimuladoResult result = SimuladoResult.builder()
                .user(user)
                .simulado(simulado)
                .score((int) correctCount)
                .totalQuestions(total)
                .completedAt(now)
                .build();
        resultRepository.save(result);

        double percent = total > 0 ? (correctCount * 100.0 / total) : 0;

        return new ExamResultDTO(
                session.getId(),
                "COMPLETED",
                (int) correctCount,
                total,
                percent,
                session.getStartedAt(),
                now,
                results
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cancel Exam
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public void cancelExam(UUID userId, UUID simuladoId) {
        sessionRepository.findByUser_IdAndSimulado_Id(userId, simuladoId).ifPresent(session -> {
            if ("IN_PROGRESS".equals(session.getStatus())) {
                session.setStatus("CANCELLED");
                session.setSubmittedAt(OffsetDateTime.now());
                sessionRepository.save(session);
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Get My Session Status
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExamResultDTO getMyResult(UUID userId, UUID simuladoId) {
        SimuladoSession session = sessionRepository.findByUser_IdAndSimulado_Id(userId, simuladoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Nenhuma sessão encontrada para este simulado."));

        Simulado simulado = simuladoRepository.findById(simuladoId)
                .orElseThrow(() -> new ResourceNotFoundException("Simulado not found"));
        simulado.getQuestions().size();

        List<Question> questions = simulado.getQuestions();
        Map<String, String> answers = session.getAnswers() != null ? session.getAnswers() : Map.of();

        List<QuestionResultDTO> results = questions.stream().map(q -> {
            String qId = q.getId().toString();
            String userAnswer = answers.get(qId);
            boolean correct = q.getCorrectOption() != null && q.getCorrectOption().equals(userAnswer);
            return new QuestionResultDTO(
                    q.getId(),
                    q.getStatement(),
                    q.getCorrectOption(),
                    userAnswer,
                    correct,
                    q.getResolution()
            );
        }).collect(Collectors.toList());

        int total = session.getTotalQuestions() != null ? session.getTotalQuestions() : questions.size();
        int score = session.getScore() != null ? session.getScore() : 0;
        double percent = total > 0 ? (score * 100.0 / total) : 0;

        return new ExamResultDTO(
                session.getId(),
                session.getStatus(),
                score,
                total,
                percent,
                session.getStartedAt(),
                session.getSubmittedAt(),
                results
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Enriched Simulados List for Student — fetches + builds in one transaction
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SimuladoListItemDTO> getAvailableSimuladoList(UUID userId, List<UUID> activeCourseIds) {
        List<Simulado> simulados;
        if (activeCourseIds.isEmpty()) {
            simulados = new java.util.ArrayList<>(simuladoRepository.findAllByCourseIsNull());
        } else {
            simulados = new java.util.ArrayList<>(simuladoRepository.findAllByCourseIdIn(activeCourseIds));
            simulados.addAll(simuladoRepository.findAllByCourseIsNull());
        }
        // Force-load lazy associations within this transaction
        simulados.forEach(s -> {
            s.getQuestions().size();
            if (s.getCourse() != null) s.getCourse().getTitle();
        });
        return buildSimuladoList(simulados, userId);
    }

    @Transactional(readOnly = true)
    public List<SimuladoListItemDTO> buildSimuladoList(List<Simulado> simulados, UUID userId) {
        Map<UUID, SimuladoSession> sessionMap = sessionRepository
                .findAllByUser_IdOrderByStartedAtDesc(userId)
                .stream()
                .collect(Collectors.toMap(
                        s -> s.getSimulado().getId(),
                        s -> s,
                        (a, b) -> a
                ));

        OffsetDateTime now = OffsetDateTime.now();

        return simulados.stream().map(sim -> {
            SimuladoSession session = sessionMap.get(sim.getId());
            String sessionStatus = session != null ? session.getStatus() : null;
            Integer sessionScore = session != null ? session.getScore() : null;
            Integer sessionTotal = session != null ? session.getTotalQuestions() : null;

            String availability;
            if (session != null && ("COMPLETED".equals(sessionStatus)
                    || "CANCELLED".equals(sessionStatus)
                    || "EXPIRED".equals(sessionStatus)
                    || "IN_PROGRESS".equals(sessionStatus))) {
                availability = "REALIZADO";
            } else if (sim.getStartDate() == null || sim.getEndDate() == null) {
                availability = "SEM_DATA";
            } else if (now.isBefore(sim.getStartDate())) {
                availability = "EM_BREVE";
            } else if (now.isAfter(sim.getEndDate())) {
                availability = "EXPIRADO";
            } else {
                availability = "DISPONIVEL";
            }

            return new SimuladoListItemDTO(
                    sim.getId(),
                    sim.getTitle(),
                    sim.getDescription(),
                    sim.getStartDate(),
                    sim.getEndDate(),
                    sim.getDurationMinutes(),
                    sim.getQuestions().size(),
                    sim.getCourse() != null ? sim.getCourse().getId().toString() : null,
                    sim.getCourse() != null ? sim.getCourse().getTitle() : "Geral",
                    sim.getCourse() != null ? sim.getCourse().getThemeColor() : null,
                    sim.getCourse() != null ? sim.getCourse().getTextColor() : null,
                    sessionStatus,
                    sessionScore,
                    sessionTotal,
                    availability
            );
        })
        .sorted((a, b) -> {
            // Sort: available first, then upcoming by date, then past/no-date
            int rankA = availabilityRank(a.availability());
            int rankB = availabilityRank(b.availability());
            if (rankA != rankB) return Integer.compare(rankA, rankB);
            if (a.startDate() != null && b.startDate() != null) {
                return a.startDate().compareTo(b.startDate());
            }
            return 0;
        })
        .collect(Collectors.toList());
    }

    private int availabilityRank(String availability) {
        return switch (availability) {
            case "DISPONIVEL" -> 0;
            case "EM_BREVE"   -> 1;
            case "REALIZADO"  -> 2;
            case "EXPIRADO"   -> 3;
            default           -> 4;
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scheduled: expire abandoned IN_PROGRESS sessions
    // ─────────────────────────────────────────────────────────────────────────

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expireAbandonedSessions() {
        List<SimuladoSession> stale = sessionRepository
                .findAllByStatusAndExpiresAtBefore("IN_PROGRESS", OffsetDateTime.now());
        if (!stale.isEmpty()) {
            OffsetDateTime now = OffsetDateTime.now();
            stale.forEach(s -> {
                s.setStatus("EXPIRED");
                s.setSubmittedAt(now);
            });
            sessionRepository.saveAll(stale);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private QuestionExamDTO toExamDTO(Question q) {
        Map<String, String> opts = new HashMap<>();
        if (q.getOptions() != null) {
            q.getOptions().forEach((k, v) -> opts.put(k, String.valueOf(v)));
        }
        return new QuestionExamDTO(
                q.getId(),
                q.getStatement(),
                opts,
                q.getBanca(),
                q.getYear(),
                q.getSubject(),
                q.getImageBase64()
        );
    }
}

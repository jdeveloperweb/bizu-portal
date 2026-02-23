package com.bizu.portal.student.domain;

import com.bizu.portal.identity.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "simulation_sessions", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    @Column(nullable = false)
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED, EXPIRED

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "correct_answers")
    private Integer correctAnswers = 0;

    @Column(name = "score_percent")
    private Double scorePercent = 0.0;
}

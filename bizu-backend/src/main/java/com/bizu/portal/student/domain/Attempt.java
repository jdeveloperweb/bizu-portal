package com.bizu.portal.student.domain;

import com.bizu.portal.content.domain.Question;
import com.bizu.portal.identity.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "attempts", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "selected_option")
    private String selectedOption;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}

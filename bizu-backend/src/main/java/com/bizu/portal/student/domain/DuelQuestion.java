package com.bizu.portal.student.domain;

import com.bizu.portal.content.domain.Question;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "duel_questions", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DuelQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "duel_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Duel duel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "round_number")
    private int roundNumber;

    @Column(name = "challenger_answer_index")
    private Integer challengerAnswerIndex;

    @Column(name = "opponent_answer_index")
    private Integer opponentAnswerIndex;

    @Column(name = "challenger_correct")
    private Boolean challengerCorrect;

    @Column(name = "opponent_correct")
    private Boolean opponentCorrect;

    private String difficulty;
}

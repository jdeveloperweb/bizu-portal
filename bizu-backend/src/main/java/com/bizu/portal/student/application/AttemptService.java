package com.bizu.portal.student.application;

import com.bizu.portal.content.application.QuestionService;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.domain.Attempt;
import com.bizu.portal.student.infrastructure.AttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final GamificationService gamificationService;

    @Transactional
    public Attempt processAttempt(User user, Question question, String selectedOption) {
        boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(selectedOption);
        
        Attempt attempt = Attempt.builder()
            .user(user)
            .question(question)
            .selectedOption(selectedOption)
            .isCorrect(isCorrect)
            .build();

        if (isCorrect) {
            gamificationService.addXp(user.getId(), 10); // 10 XP per correct question
        }

        return attemptRepository.save(attempt);
    }
}

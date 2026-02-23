package com.bizu.portal.shared.api;

import com.bizu.portal.content.application.CourseService;
import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.domain.Module;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.application.QuestionService;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.application.GamificationService;
import com.bizu.portal.content.domain.Flashcard;
import com.bizu.portal.content.domain.FlashcardDeck;
import com.bizu.portal.content.infrastructure.FlashcardDeckRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/v1/public/seed")
@RequiredArgsConstructor
public class SeedController {

    private final CourseService courseService;
    private final QuestionService questionService;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;
    private final FlashcardDeckRepository deckRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<String> seedData() {
        // 1. Create a Course
        Course course = Course.builder()
            .title("Magistratura Federal - Completo")
            .description("O curso mais completo para quem busca a toga federal.")
            .status("PUBLICADO")
            .modules(new ArrayList<>())
            .build();

        Module m1 = Module.builder()
            .title("Direito Administrativo")
            .description("Fundamentos e Atos Administrativos")
            .orderIndex(1)
            .course(course)
            .build();
        
        course.getModules().add(m1);
        courseService.save(course);

        // 2. Create Questions
        Map<String, Object> options = new HashMap<>();
        options.put("A", "Discricionariedade");
        options.put("B", "Vinculação");
        options.put("C", "Hierarquia");
        options.put("D", "Autotutela");

        Question q1 = Question.builder()
            .statement("O poder da administração de anular seus próprios atos quando eivados de vícios é o poder de:")
            .options(options)
            .correctOption("D")
            .resolution("Conforme a Súmula 473 do STF, a administração pode anular seus próprios atos...")
            .banca("CESPE")
            .year(2024)
            .subject("Direito Administrativo")
            .topic("Poderes")
            .difficulty("MÉDIO")
            .questionType("MULTIPLE_CHOICE")
            .build();
        
        questionService.save(q1);

        // 3. Create Flashcard Decks
        FlashcardDeck d1 = FlashcardDeck.builder()
            .title("Direito Administrativo - Base")
            .description("Cartas essenciais sobre atos e poderes.")
            .icon("Shield")
            .cards(new ArrayList<>())
            .build();
        
        Flashcard f1 = Flashcard.builder()
            .front("Qual o prazo decadencial para anular atos?")
            .back("5 anos, salvo má-fé.")
            .subject("Direito Administrativo")
            .deck(d1)
            .build();
        
        d1.getCards().add(f1);
        deckRepository.save(d1);

        // 4. Fake XP for current users to test ranking
        userRepository.findAll().forEach(user -> {
            gamificationService.addXp(user.getId(), new Random().nextInt(5000));
        });

        return ResponseEntity.ok("Banco de dados populado com sucesso!");
    }
}

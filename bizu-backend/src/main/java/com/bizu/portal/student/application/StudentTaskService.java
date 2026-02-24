package com.bizu.portal.student.application;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.domain.StudentTask;
import com.bizu.portal.student.infrastructure.StudentTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentTaskService {

    private final StudentTaskRepository studentTaskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<StudentTaskDTO> getUserTasks(UUID userId) {
        return studentTaskRepository.findAllByStudentIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskSuggestionDTO> generateSuggestions(UUID userId) {
        List<TaskSuggestionDTO> suggestions = new java.util.ArrayList<>();
        
        CreateStudentTaskDTO task1 = new CreateStudentTaskDTO();
        task1.setTitle("Revisar matérias com baixo desempenho");
        task1.setSubject("Geral");
        task1.setPriority("alta");
        task1.setSource("desempenho");
        task1.setDueDate("Hoje");
        task1.setStatus("pendente");
        
        suggestions.add(TaskSuggestionDTO.builder()
            .text("Revisar matérias com acerto abaixo da média (<70%)")
            .type("alert")
            .color("text-red-500")
            .actionLabel("Criar tarefa")
            .taskToCreate(task1)
            .build());

        CreateStudentTaskDTO task2 = new CreateStudentTaskDTO();
        task2.setTitle("Resolver 20 questões");
        task2.setSubject("Geral");
        task2.setPriority("media");
        task2.setSource("sistema");
        task2.setDueDate("Hoje");
        task2.setStatus("pendente");

        suggestions.add(TaskSuggestionDTO.builder()
            .text("Resolver 20 questões para bater a sua meta diária")
            .type("trend")
            .color("text-amber-500")
            .actionLabel("Criar tarefa")
            .taskToCreate(task2)
            .build());

        CreateStudentTaskDTO task3 = new CreateStudentTaskDTO();
        task3.setTitle("Simulado de fixação");
        task3.setSubject("Geral");
        task3.setPriority("alta");
        task3.setSource("sistema");
        task3.setDueDate("Fim de semana");
        task3.setStatus("pendente");

        suggestions.add(TaskSuggestionDTO.builder()
            .text("Fazer um simulado para revisar o conteúdo estudado na semana")
            .type("chart")
            .color("text-indigo-500")
            .actionLabel("Criar tarefa")
            .taskToCreate(task3)
            .build());

        return suggestions;
    }

    @Transactional
    public StudentTaskDTO createTask(UUID userId, CreateStudentTaskDTO createDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudentTask task = StudentTask.builder()
                .student(user)
                .title(createDTO.getTitle())
                .description(createDTO.getDescription())
                .subject(createDTO.getSubject())
                .priority(createDTO.getPriority())
                .status(createDTO.getStatus() != null ? createDTO.getStatus() : "pendente")
                .source(createDTO.getSource() != null ? createDTO.getSource() : "manual")
                .dueDate(createDTO.getDueDate() != null ? createDTO.getDueDate() : "Sem prazo")
                .linkedActionType(createDTO.getLinkedActionType())
                .linkedActionLabel(createDTO.getLinkedActionLabel())
                .linkedActionHref(createDTO.getLinkedActionHref())
                .build();

        StudentTask savedTask = studentTaskRepository.save(task);
        return mapToDTO(savedTask);
    }

    @Transactional
    public void updateTaskStatus(UUID taskId, UUID userId, String newStatus) {
        StudentTask task = getTaskByIdAndUserId(taskId, userId);
        task.setStatus(newStatus);
        studentTaskRepository.save(task);
    }

    @Transactional
    public void deleteTask(UUID taskId, UUID userId) {
        StudentTask task = getTaskByIdAndUserId(taskId, userId);
        studentTaskRepository.delete(task);
    }

    private StudentTask getTaskByIdAndUserId(UUID taskId, UUID userId) {
        StudentTask task = studentTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getStudent().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to access this task");
        }
        
        return task;
    }

    private StudentTaskDTO mapToDTO(StudentTask task) {
        return StudentTaskDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .subject(task.getSubject())
                .priority(task.getPriority())
                .status(task.getStatus())
                .source(task.getSource())
                .dueDate(task.getDueDate())
                .linkedActionType(task.getLinkedActionType())
                .linkedActionLabel(task.getLinkedActionLabel())
                .linkedActionHref(task.getLinkedActionHref())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}

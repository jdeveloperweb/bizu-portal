package com.bizu.portal.student.application;

import com.bizu.portal.content.infrastructure.ModuleRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.domain.Note;
import com.bizu.portal.student.infrastructure.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final ModuleRepository moduleRepository;

    @Transactional(readOnly = true)
    public List<NoteDTO> getUserNotes(UUID userId) {
        return noteRepository.findByUserIdOrderByPinnedDescUpdatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoteDTO createNote(UUID userId, CreateNoteRequest request) {
        Note note = new Note();
        note.setUser(User.builder().id(userId).build());
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        if (request.getModuleId() != null) {
            note.setModule(moduleRepository.findById(request.getModuleId())
                    .orElseThrow(() -> new RuntimeException("Module not found")));
        }
        note.setTags(request.getTags() != null ? String.join(",", request.getTags()) : null);
        note.setPinned(request.isPinned());
        note.setStarred(request.isStarred());
        if (request.getLinkedTo() != null) {
            note.setLinkedType(request.getLinkedTo().getType());
            note.setLinkedLabel(request.getLinkedTo().getLabel());
        }

        note = noteRepository.save(note);
        return toDTO(note);
    }

    @Transactional
    public NoteDTO updateNote(UUID noteId, UUID userId, UpdateNoteRequest request) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this note");
        }

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        
        if (request.getModuleId() != null) {
            note.setModule(moduleRepository.findById(request.getModuleId())
                    .orElseThrow(() -> new RuntimeException("Module not found")));
        } else {
            note.setModule(null);
        }

        note.setTags(request.getTags() != null ? String.join(",", request.getTags()) : null);
        note.setPinned(request.isPinned());
        note.setStarred(request.isStarred());
        if (request.getLinkedTo() != null) {
            note.setLinkedType(request.getLinkedTo().getType());
            note.setLinkedLabel(request.getLinkedTo().getLabel());
        } else {
            note.setLinkedType(null);
            note.setLinkedLabel(null);
        }

        note = noteRepository.save(note);
        return toDTO(note);
    }

    @Transactional
    public void deleteNote(UUID noteId, UUID userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this note");
        }

        noteRepository.delete(note);
    }

    @Transactional
    public NoteDTO togglePin(UUID noteId, UUID userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this note");
        }

        note.setPinned(!note.isPinned());
        note = noteRepository.save(note);
        return toDTO(note);
    }

    @Transactional
    public NoteDTO toggleStar(UUID noteId, UUID userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this note");
        }

        note.setStarred(!note.isStarred());
        note = noteRepository.save(note);
        return toDTO(note);
    }

    private NoteDTO toDTO(Note note) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM");
        String subjectName = note.getModule() != null ? note.getModule().getTitle() : "Geral";
        
        NoteDTO.LinkedToDTO linkedTo = null;
        if (note.getLinkedType() != null && note.getLinkedLabel() != null) {
            linkedTo = new NoteDTO.LinkedToDTO(note.getLinkedType(), note.getLinkedLabel());
        }

        List<String> tagsList = null;
        if (note.getTags() != null && !note.getTags().isEmpty()) {
            tagsList = List.of(note.getTags().split(","));
        } else {
            tagsList = List.of();
        }

        return NoteDTO.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .subject(subjectName)
                .moduleId(note.getModule() != null ? note.getModule().getId() : null)
                .tags(tagsList)
                .linkedTo(linkedTo)
                .pinned(note.isPinned())
                .starred(note.isStarred())
                .createdAt(note.getCreatedAt() != null ? note.getCreatedAt().format(formatter) : "")
                .updatedAt(note.getUpdatedAt() != null ? note.getUpdatedAt().format(formatter) : "")
                .build();
    }
}

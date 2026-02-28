package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.CreateNoteRequest;
import com.bizu.portal.student.application.NoteDTO;
import com.bizu.portal.student.application.NoteService;
import com.bizu.portal.student.application.UpdateNoteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<NoteDTO>> getUserNotes(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = syncUser(jwt);
        return ResponseEntity.ok(noteService.getUserNotes(userId));
    }

    @PostMapping
    public ResponseEntity<NoteDTO> createNote(@AuthenticationPrincipal Jwt jwt, @RequestBody CreateNoteRequest request) {
        UUID userId = syncUser(jwt);
        return ResponseEntity.ok(noteService.createNote(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteDTO> updateNote(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt, @RequestBody UpdateNoteRequest request) {
        UUID userId = syncUser(jwt);
        return ResponseEntity.ok(noteService.updateNote(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = syncUser(jwt);
        noteService.deleteNote(id, userId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<NoteDTO> togglePin(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = syncUser(jwt);
        return ResponseEntity.ok(noteService.togglePin(id, userId));
    }

    @PatchMapping("/{id}/star")
    public ResponseEntity<NoteDTO> toggleStar(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = syncUser(jwt);
        return ResponseEntity.ok(noteService.toggleStar(id, userId));
    }

    private UUID syncUser(Jwt jwt) {
        return userService.resolveUserId(jwt);
    }
}

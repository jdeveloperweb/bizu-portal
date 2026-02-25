package com.bizu.portal.shared.api;

import com.bizu.portal.shared.application.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/uploads")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUploadController {

    private final FileStorageService storageService;

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String filename = storageService.store(file);
        // The URL the frontend will use to access the file
        String fileUrl = "/api/v1/public/files/" + filename;
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }
}

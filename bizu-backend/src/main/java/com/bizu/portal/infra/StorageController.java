package com.bizu.portal.infra;

import com.bizu.portal.shared.application.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StorageController {

    private final FileStorageService storageService;

    @PostMapping("/admin/files/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        String filename = storageService.store(file);
        String url = "/api/v1/public/files/" + filename;
        return ResponseEntity.ok(url);
    }
}

package com.bizu.portal.shared.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Path rootLocation;

    public FileStorageService(@Value("${app.storage.location:uploads}") String storageLocation) {
        this.rootLocation = Paths.get(storageLocation);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage", e);
        }
    }

    public String store(MultipartFile file) {
        return storeInSubdirectory(file, null);
    }

    public String storeInSubdirectory(MultipartFile file, String subdirectory) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            Path subPath = subdirectory != null ? this.rootLocation.resolve(subdirectory) : this.rootLocation;
            Files.createDirectories(subPath);

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path destinationFile = subPath.resolve(Paths.get(filename))
                    .normalize().toAbsolutePath();
            
            if (!destinationFile.startsWith(this.rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Cannot store file outside current directory.");
            }
            
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("File stored successfully: {}", filename);
            return subdirectory != null ? subdirectory + "/" + filename : filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    public void deleteSubdirectory(String subdirectory) {
        try {
            Path subPath = this.rootLocation.resolve(subdirectory).normalize().toAbsolutePath();
            if (!subPath.startsWith(this.rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Cannot delete outside root location.");
            }
            if (Files.exists(subPath)) {
                try (var stream = Files.walk(subPath)) {
                    stream.sorted(java.util.Comparator.reverseOrder())
                          .map(Path::toFile)
                          .forEach(java.io.File::delete);
                }
            }
        } catch (IOException e) {
            log.error("Could not delete subdirectory: {}", subdirectory, e);
        }
    }

    public Path load(String filename) {
        // Support loading from subdirectories
        return rootLocation.resolve(filename).normalize();
    }
}

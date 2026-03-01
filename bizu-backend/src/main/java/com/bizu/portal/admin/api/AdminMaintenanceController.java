package com.bizu.portal.admin.api;

import com.bizu.portal.admin.application.AdminMaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/admin/maintenance")
@RequiredArgsConstructor
public class AdminMaintenanceController {

    private final AdminMaintenanceService maintenanceService;

    @DeleteMapping("/reset-content")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> resetPlatformContent(@RequestBody Map<String, String> request) {
        String confirmation = request.get("confirmation");
        if (confirmation == null || !confirmation.equals("CONFIRMAR")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Confirmação de segurança inválida."));
        }

        maintenanceService.resetPlatformContent();

        return ResponseEntity.ok(Map.of("message", "Plataforma resetada com sucesso."));
    }
}

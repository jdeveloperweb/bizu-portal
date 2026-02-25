package com.bizu.portal.identity.infrastructure;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakService {

    @Value("${KEYCLOAK_AUTH_SERVER_URL:http://localhost:8280/auth}")
    private String authServerUrl;

    @Value("${KEYCLOAK_REALM:bizu-portal}")
    private String realm;

    @Value("${KEYCLOAK_ADMIN:admin}")
    private String adminUser;

    @Value("${KEYCLOAK_ADMIN_PASSWORD:admin}")
    private String adminPassword;

    private final RestTemplate restTemplate = new RestTemplate();

    public void createKeycloakUser(String name, String email, String password) {
        String adminToken = getAdminToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);

        Map<String, Object> user = new HashMap<>();
        user.put("username", email);
        user.put("email", email);
        user.put("enabled", true);
        user.put("firstName", name);
        
        Map<String, Object> credentials = new HashMap<>();
        credentials.put("type", "password");
        credentials.put("value", password);
        credentials.put("temporary", false);
        
        user.put("credentials", Collections.singletonList(credentials));

        String url = String.format("%s/admin/realms/%s/users", authServerUrl, realm);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, new HttpEntity<>(user, headers), String.class);
            if (response.getStatusCode() != HttpStatus.CREATED) {
                throw new RuntimeException("Falha ao criar usuário no Keycloak: " + response.getBody());
            }
            log.info("Usuário {} criado com sucesso no Keycloak", email);
        } catch (Exception e) {
            log.error("Erro ao integrar com Keycloak", e);
            throw new RuntimeException("Erro na integração com serviço de identidade: " + e.getMessage());
        }
    }

    public void updateKeycloakUser(String email, String name, String newEmail) {
        String adminToken = getAdminToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Search for user by current email to get their ID
        String searchUrl = String.format("%s/admin/realms/%s/users?username=%s", authServerUrl, realm, email);
        
        try {
            ResponseEntity<List> searchResponse = restTemplate.exchange(
                searchUrl, 
                HttpMethod.GET, 
                new HttpEntity<>(headers), 
                List.class
            );

            List users = searchResponse.getBody();
            if (users == null || users.isEmpty()) {
                log.warn("Usuário não encontrado no Keycloak para atualização: {}", email);
                return;
            }

            Map<String, Object> keycloakUser = (Map<String, Object>) users.get(0);
            String userId = (String) keycloakUser.get("id");

            Map<String, Object> updates = new HashMap<>();
            if (name != null) updates.put("firstName", name);
            if (newEmail != null) {
                updates.put("email", newEmail);
                updates.put("username", newEmail);
            }

            // Update user by ID
            String updateUrl = String.format("%s/admin/realms/%s/users/%s", authServerUrl, realm, userId);
            restTemplate.exchange(updateUrl, HttpMethod.PUT, new HttpEntity<>(updates, headers), String.class);
            
            log.info("Usuário {} (ID: {}) atualizado com sucesso no Keycloak", email, userId);
        } catch (Exception e) {
            log.error("Erro ao atualizar usuário no Keycloak", e);
            throw new RuntimeException("Erro ao atualizar usuário no serviço de identidade: " + e.getMessage());
        }
    }

    public void deleteKeycloakUser(String email) {
        String adminToken = getAdminToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);

        // Search for user by email to get their ID
        String searchUrl = String.format("%s/admin/realms/%s/users?username=%s", authServerUrl, realm, email);
        
        try {
            ResponseEntity<List> searchResponse = restTemplate.exchange(
                searchUrl, 
                HttpMethod.GET, 
                new HttpEntity<>(headers), 
                List.class
            );

            List users = searchResponse.getBody();
            if (users == null || users.isEmpty()) {
                log.warn("Usuário não encontrado no Keycloak para exclusão: {}", email);
                return;
            }

            Map<String, Object> keycloakUser = (Map<String, Object>) users.get(0);
            String userId = (String) keycloakUser.get("id");

            // Delete user by ID
            String deleteUrl = String.format("%s/admin/realms/%s/users/%s", authServerUrl, realm, userId);
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, new HttpEntity<>(headers), String.class);
            
            log.info("Usuário {} (ID: {}) deletado com sucesso do Keycloak", email, userId);
        } catch (Exception e) {
            log.error("Erro ao deletar usuário no Keycloak", e);
            throw new RuntimeException("Erro ao remover usuário do serviço de identidade");
        }
    }

    private String getAdminToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "password");
        map.add("client_id", "admin-cli");
        map.add("username", adminUser);
        map.add("password", adminPassword);

        String url = String.format("%s/realms/master/protocol/openid-connect/token", authServerUrl);
        
        try {
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            return (String) response.get("access_token");
        } catch (Exception e) {
            log.error("Erro ao obter token de admin do Keycloak", e);
            throw new RuntimeException("Erro de autenticação administrativa no Keycloak");
        }
    }
}

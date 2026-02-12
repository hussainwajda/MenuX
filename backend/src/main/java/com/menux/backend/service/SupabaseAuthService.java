package com.menux.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.menux.backend.config.SupabaseProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseAuthService {

    private final WebClient supabaseWebClient;
    private final SupabaseProperties properties;

    public UUID createUser(String email, String password, String name, String phone) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", email);
        payload.put("password", password);
        payload.put("email_confirm", true);
        Map<String, Object> metadata = new HashMap<>();
        if (name != null && !name.isBlank()) {
            metadata.put("name", name);
        }
        if (phone != null && !phone.isBlank()) {
            metadata.put("phone", phone);
        }
        if (!metadata.isEmpty()) {
            payload.put("user_metadata", metadata);
        }

        JsonNode response = supabaseWebClient.post()
                .uri("/auth/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .header("apikey", properties.serviceRoleKey())
                .header("Authorization", "Bearer " + properties.serviceRoleKey())
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .onErrorMap(WebClientResponseException.class, this::mapAuthError)
                .block();

        if (response == null || response.get("id") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Supabase user creation failed");
        }
        return UUID.fromString(response.get("id").asText());
    }

    public void deleteUser(UUID userId) {
        supabaseWebClient.delete()
                .uri("/auth/v1/admin/users/{id}", userId)
                .header("apikey", properties.serviceRoleKey())
                .header("Authorization", "Bearer " + properties.serviceRoleKey())
                .retrieve()
                .bodyToMono(Void.class)
                .onErrorMap(WebClientResponseException.class, this::mapAuthError)
                .block();
    }

    public SupabaseToken signInWithPassword(String email, String password) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", email);
        payload.put("password", password);

        JsonNode response = supabaseWebClient.post()
                .uri("/auth/v1/token?grant_type=password")
                .contentType(MediaType.APPLICATION_JSON)
                .header("apikey", properties.anonKey())
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .onErrorMap(WebClientResponseException.class, this::mapAuthError)
                .block();

        if (response == null || response.get("access_token") == null || response.get("user") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid login");
        }

        String accessToken = response.get("access_token").asText();
        String refreshToken = response.hasNonNull("refresh_token") ? response.get("refresh_token").asText() : null;
        Long expiresIn = response.hasNonNull("expires_in") ? response.get("expires_in").asLong() : null;
        UUID userId = UUID.fromString(response.get("user").get("id").asText());
        return new SupabaseToken(accessToken, refreshToken, expiresIn, userId);
    }

    public UUID getUserIdFromAccessToken(String accessToken) {
        JsonNode response = supabaseWebClient.get()
                .uri("/auth/v1/user")
                .header("apikey", properties.anonKey())
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .onErrorMap(WebClientResponseException.class, this::mapAuthError)
                .block();

        if (response == null || response.get("id") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access token");
        }
        return UUID.fromString(response.get("id").asText());
    }

    private ResponseStatusException mapAuthError(WebClientResponseException ex) {
        String body = ex.getResponseBodyAsString();
        String lowerBody = body != null ? body.toLowerCase() : "";
        boolean invalidCreds = lowerBody.contains("invalid login credentials");

        log.warn(
                "Supabase auth error: status={} body={}",
                ex.getStatusCode(),
                body
        );

        if (invalidCreds) {
            return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String message = "Supabase auth error";
        if (body != null && !body.isBlank()) {
            message = message + ": " + body;
        }
        HttpStatus status = ex.getStatusCode().is4xxClientError() ? HttpStatus.BAD_GATEWAY : HttpStatus.BAD_GATEWAY;
        return new ResponseStatusException(status, message);
    }

    public record SupabaseToken(String accessToken, String refreshToken, Long expiresIn, UUID userId) {}
}

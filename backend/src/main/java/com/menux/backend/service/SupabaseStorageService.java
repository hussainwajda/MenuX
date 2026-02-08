package com.menux.backend.service;

import com.menux.backend.config.SupabaseProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {

    private final WebClient supabaseWebClient;
    private final SupabaseProperties properties;

    public String uploadLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Logo file is required");
        }

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String objectName = UUID.randomUUID().toString();
        if (extension != null && !extension.isBlank()) {
            objectName = objectName + "." + extension.toLowerCase();
        }

        String path = properties.storageBucket() + "/" + objectName;

        try {
            supabaseWebClient.post()
                    .uri("/storage/v1/object/{path}", path)
                    .header("apikey", properties.serviceRoleKey())
                    .header("Authorization", "Bearer " + properties.serviceRoleKey())
                    .contentType(MediaType.parseMediaType(contentType(file)))
                    .bodyValue(file.getBytes())
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorMap(WebClientResponseException.class, this::mapStorageError)
                    .block();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read logo file");
        }

        return publicUrl(objectName);
    }

    private String publicUrl(String objectName) {
        return properties.url() + "/storage/v1/object/public/" + properties.storageBucket() + "/" + objectName;
    }

    private String contentType(MultipartFile file) {
        return file.getContentType() != null ? file.getContentType() : "application/octet-stream";
    }

    private ResponseStatusException mapStorageError(WebClientResponseException ex) {
        String body = ex.getResponseBodyAsString();
        String message = "Supabase storage error";
        if (body != null && !body.isBlank()) {
            message = message + ": " + body;
        }
        HttpStatus status = ex.getStatusCode().is4xxClientError() ? HttpStatus.BAD_REQUEST : HttpStatus.BAD_GATEWAY;
        return new ResponseStatusException(status, message);
    }
}

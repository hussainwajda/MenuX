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
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {

    private final WebClient supabaseWebClient;
    private final SupabaseProperties properties;
    private static final long MAX_IMAGE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    public String uploadLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Logo file is required");
        }
        validateImage(file);

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String objectName = "logos/" + UUID.randomUUID();
        if (extension != null && !extension.isBlank()) {
            objectName = objectName + "." + extension.toLowerCase();
        }
        final String objectNameFinal = objectName;

        try {
            supabaseWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/storage/v1/object")
                            .pathSegment(properties.storageBucket())
                            .pathSegment(objectNameFinal)
                            .build())
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

        return publicUrl(properties.storageBucket(), objectNameFinal);
    }

    public String uploadMenuItemImage(UUID restaurantId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item image file is required");
        }
        validateImage(file);

        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String objectName = "menu-items/" + restaurantId + "/" + UUID.randomUUID();
        if (extension != null && !extension.isBlank()) {
            objectName = objectName + "." + extension.toLowerCase();
        }
        final String objectNameFinal = objectName;

        try {
            supabaseWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/storage/v1/object")
                            .pathSegment(properties.menuItemsBucket())
                            .pathSegment(objectNameFinal)
                            .build())
                    .header("apikey", properties.serviceRoleKey())
                    .header("Authorization", "Bearer " + properties.serviceRoleKey())
                    .contentType(MediaType.parseMediaType(contentType(file)))
                    .bodyValue(file.getBytes())
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorMap(WebClientResponseException.class, this::mapStorageError)
                    .block();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read Menu Item Image file");
        }

        return publicUrl(properties.menuItemsBucket(), objectNameFinal);
    }

    private void validateImage(MultipartFile file) {
        String type = contentType(file);
        if (!ALLOWED_IMAGE_TYPES.contains(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported image type");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image size exceeds 5MB");
        }
    }

    private String publicUrl(String bucket, String objectName) {
        return properties.url() + "/storage/v1/object/public/" + bucket + "/" + objectName;
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

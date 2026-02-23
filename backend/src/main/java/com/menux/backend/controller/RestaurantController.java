package com.menux.backend.controller;

import com.menux.backend.dto.RestaurantCreateRequest;
import com.menux.backend.dto.RestaurantLoginRequest;
import com.menux.backend.dto.RestaurantLoginResponse;
import com.menux.backend.dto.RestaurantResponse;
import com.menux.backend.dto.RestaurantUpdateRequest;
import com.menux.backend.service.AdminAuthService;
import com.menux.backend.service.RestaurantService;
import com.menux.backend.service.SupabaseAuthService;
import com.menux.backend.service.SupabaseStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService service;
    private final SupabaseStorageService storageService;
    private final SupabaseAuthService supabaseAuthService;
    private final AdminAuthService adminAuthService;

    @PostMapping(value = "/upload/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadLogo(
            @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        if (!adminAuthService.isAdmin(httpRequest)) {
            String accessToken = extractBearerToken(authorization);
            supabaseAuthService.getUserIdFromAccessToken(accessToken);
        }
        String url = storageService.uploadLogo(file);
        return Map.of("logo_url", url);
    }

    @PostMapping
    public RestaurantResponse create(
            @Valid @RequestBody RestaurantCreateRequest request,
            HttpServletRequest httpRequest
    ) {
        adminAuthService.requireAdmin(httpRequest);
        return service.create(request);
    }

    @GetMapping
    public Page<RestaurantResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest
    ) {
        adminAuthService.requireAdmin(httpRequest);
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return service.getAll(pageable);
    }

    @GetMapping("/{id}")
    public RestaurantResponse getById(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        if (adminAuthService.isAdmin(httpRequest)) {
            return service.getById(id);
        }
        String accessToken = extractBearerToken(authorization);
        UUID authUserId = supabaseAuthService.getUserIdFromAccessToken(accessToken);
        return service.getByIdForUser(id, authUserId);
    }

    @PostMapping("/auth/login")
    public RestaurantLoginResponse login(@Valid @RequestBody RestaurantLoginRequest request) {
        return service.login(request);
    }

    @PatchMapping("/{id}")
    public RestaurantResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody RestaurantUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        boolean isAdmin = adminAuthService.isAdmin(httpRequest);
        UUID authUserId = null;
        if (!isAdmin) {
            String accessToken = extractBearerToken(authorization);
            authUserId = supabaseAuthService.getUserIdFromAccessToken(accessToken);
        }
        return service.update(id, request, isAdmin, authUserId);
    }

    @DeleteMapping("/{id}")
    public void deactivate(@PathVariable UUID id, HttpServletRequest httpRequest) {
        adminAuthService.requireAdmin(httpRequest);
        service.deactivate(id);
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Authorization bearer token required");
        }
        return authorization.substring("Bearer ".length());
    }
}

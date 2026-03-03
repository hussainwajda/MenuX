package com.menux.backend.rbac.controller;

import com.menux.backend.rbac.api.ApiResponse;
import com.menux.backend.rbac.dto.AuthLoginRequest;
import com.menux.backend.rbac.dto.AuthLoginResponse;
import com.menux.backend.rbac.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "RBAC Auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/login")
    @Operation(summary = "Owner login")
    public ApiResponse<AuthLoginResponse> ownerLogin(@Valid @RequestBody AuthLoginRequest request) {
        return ApiResponse.ok("Login successful", authService.login(request));
    }

    @PostMapping("/captain/login")
    @Operation(summary = "Captain / staff login")
    public ApiResponse<AuthLoginResponse> captainLogin(@Valid @RequestBody AuthLoginRequest request) {
        return ApiResponse.ok("Login successful", authService.login(request));
    }

    @PostMapping("/auth/restaurant/session")
    @Operation(summary = "Create owner RBAC session using restaurant bearer token")
    public ApiResponse<AuthLoginResponse> ownerSession(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ApiResponse.ok(
                "RBAC session created",
                authService.ownerSessionFromRestaurantAccessToken(authorization)
        );
    }
}

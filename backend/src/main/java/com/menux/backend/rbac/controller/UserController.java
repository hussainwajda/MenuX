package com.menux.backend.rbac.controller;

import com.menux.backend.rbac.api.ApiResponse;
import com.menux.backend.rbac.dto.UserCreateRequest;
import com.menux.backend.rbac.dto.UserResponse;
import com.menux.backend.rbac.dto.UserStatusRequest;
import com.menux.backend.rbac.dto.UserUpdateRequest;
import com.menux.backend.rbac.security.PermissionRequired;
import com.menux.backend.rbac.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "RBAC Users")
public class UserController {

    private final UserService userService;

    @PostMapping
    @PermissionRequired("users.manage")
    @Operation(summary = "Create user")
    public ApiResponse<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        return ApiResponse.ok("User created", userService.createUser(request));
    }

    @GetMapping
    @PermissionRequired("users.manage")
    @Operation(summary = "List users")
    public ApiResponse<List<UserResponse>> list() {
        return ApiResponse.ok("Users fetched", userService.listUsers());
    }

    @PutMapping("/{id}")
    @PermissionRequired("users.manage")
    @Operation(summary = "Update user")
    public ApiResponse<UserResponse> update(@PathVariable UUID id, @Valid @RequestBody UserUpdateRequest request) {
        return ApiResponse.ok("User updated", userService.updateUser(id, request));
    }

    @PatchMapping("/{id}/status")
    @PermissionRequired("users.manage")
    @Operation(summary = "Activate/deactivate user")
    public ApiResponse<UserResponse> status(@PathVariable UUID id, @Valid @RequestBody UserStatusRequest request) {
        return ApiResponse.ok("User status updated", userService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @PermissionRequired("users.manage")
    @Operation(summary = "Soft delete user")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ApiResponse.ok("User deleted");
    }
}

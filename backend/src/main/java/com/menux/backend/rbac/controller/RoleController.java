package com.menux.backend.rbac.controller;

import com.menux.backend.rbac.api.ApiResponse;
import com.menux.backend.rbac.dto.RoleCreateRequest;
import com.menux.backend.rbac.dto.RoleResponse;
import com.menux.backend.rbac.dto.RoleUpdateRequest;
import com.menux.backend.rbac.security.PermissionRequired;
import com.menux.backend.rbac.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Tag(name = "RBAC Roles")
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @PermissionRequired("users.manage")
    @Operation(summary = "Create role")
    public ApiResponse<RoleResponse> create(@Valid @RequestBody RoleCreateRequest request) {
        return ApiResponse.ok("Role created", roleService.createRole(request));
    }

    @GetMapping
    @PermissionRequired("users.manage")
    @Operation(summary = "List roles")
    public ApiResponse<List<RoleResponse>> list() {
        return ApiResponse.ok("Roles fetched", roleService.listRoles());
    }

    @PutMapping("/{id}")
    @PermissionRequired("users.manage")
    @Operation(summary = "Update role")
    public ApiResponse<RoleResponse> update(@PathVariable UUID id, @Valid @RequestBody RoleUpdateRequest request) {
        return ApiResponse.ok("Role updated", roleService.updateRole(id, request));
    }

    @DeleteMapping("/{id}")
    @PermissionRequired("users.manage")
    @Operation(summary = "Delete role")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        roleService.deleteRole(id);
        return ApiResponse.ok("Role deleted");
    }
}

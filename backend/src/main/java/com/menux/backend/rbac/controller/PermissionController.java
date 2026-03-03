package com.menux.backend.rbac.controller;

import com.menux.backend.rbac.api.ApiResponse;
import com.menux.backend.rbac.dto.PermissionModulesResponse;
import com.menux.backend.rbac.security.PermissionRequired;
import com.menux.backend.rbac.service.PermissionCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@Tag(name = "RBAC Permissions")
public class PermissionController {

    private final PermissionCatalogService permissionCatalogService;

    @GetMapping("/modules")
    @PermissionRequired("users.manage")
    @Operation(summary = "List all available permissions grouped by module")
    public ApiResponse<PermissionModulesResponse> modules() {
        return ApiResponse.ok("Permission modules fetched", permissionCatalogService.getGroupedPermissionModules());
    }
}

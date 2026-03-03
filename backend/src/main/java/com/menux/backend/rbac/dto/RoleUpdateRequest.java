package com.menux.backend.rbac.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RoleUpdateRequest(
        @NotBlank @Size(max = 80) String name,
        @Size(max = 300) String description,
        @NotEmpty List<@NotBlank String> permissionKeys
) {
}

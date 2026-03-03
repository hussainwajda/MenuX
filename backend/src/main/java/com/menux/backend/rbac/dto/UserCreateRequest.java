package com.menux.backend.rbac.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UserCreateRequest(
        @NotBlank @Size(max = 120) String name,
        @Email @NotBlank @Size(max = 160) String email,
        @NotBlank @Size(min = 8, max = 128) String password,
        @NotNull UUID roleId,
        Boolean isActive
) {
}

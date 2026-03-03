package com.menux.backend.rbac.dto;

import jakarta.validation.constraints.NotNull;

public record UserStatusRequest(
        @NotNull Boolean isActive
) {
}

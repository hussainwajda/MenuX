package com.menux.backend.rbac.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RoleResponse(
        UUID id,
        String name,
        String description,
        UUID restaurantId,
        List<String> permissions,
        Instant createdAt
) {
}

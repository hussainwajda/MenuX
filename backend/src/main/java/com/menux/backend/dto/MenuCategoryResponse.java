package com.menux.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record MenuCategoryResponse(
        UUID id,
        UUID restaurantId,
        String name,
        Integer sortOrder,
        boolean isActive,
        Instant createdAt
) {}

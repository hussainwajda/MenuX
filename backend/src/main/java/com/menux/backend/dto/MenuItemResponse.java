package com.menux.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MenuItemResponse(
        UUID id,
        UUID restaurantId,
        UUID categoryId,
        String name,
        String description,
        BigDecimal price,
        boolean isVeg,
        boolean isAvailable,
        String imageUrl,
        Instant createdAt
) {}

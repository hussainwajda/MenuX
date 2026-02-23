package com.menux.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record MenuItemWithVariantsResponse(
        UUID itemId,
        String name,
        String description,
        BigDecimal price,
        Boolean isVeg,
        Boolean isAvailable,
        String imageUrl,
        List<MenuVariantResponse> variants
) {}

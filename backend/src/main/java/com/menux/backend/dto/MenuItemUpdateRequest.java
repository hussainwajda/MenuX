package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.UUID;

public record MenuItemUpdateRequest(
        @JsonAlias("category_id") UUID categoryId,
        String name,
        String description,
        @PositiveOrZero BigDecimal price,
        @JsonAlias("is_veg") Boolean isVeg,
        @JsonAlias("is_available") Boolean isAvailable,
        @JsonAlias("image_url") String imageUrl
) {}

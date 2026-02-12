package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.UUID;

public record MenuItemCreateRequest(
        @JsonAlias("category_id") @NotNull UUID categoryId,
        @NotBlank String name,
        String description,
        @NotNull @PositiveOrZero BigDecimal price,
        @JsonAlias("is_veg") Boolean isVeg,
        @JsonAlias("is_available") Boolean isAvailable,
        @JsonAlias("image_url") String imageUrl
) {}

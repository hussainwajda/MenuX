package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record MenuCategoryCreateRequest(
        @NotBlank String name,
        @JsonAlias("sort_order") Integer sortOrder,
        @JsonAlias("is_active") Boolean isActive
) {}

package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record MenuCategoryUpdateRequest(
        String name,
        @JsonAlias("sort_order") Integer sortOrder,
        @JsonAlias("is_active") Boolean isActive
) {}

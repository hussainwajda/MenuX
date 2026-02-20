package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record TableCreateRequest(
        @JsonAlias("table_number") @NotBlank String tableNumber,
        @JsonAlias("is_active") Boolean isActive
) {}

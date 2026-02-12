package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;

public record MenuItemAvailabilityRequest(
        @JsonAlias("is_available") @NotNull Boolean isAvailable
) {}

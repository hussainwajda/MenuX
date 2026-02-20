package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record TableUpdateRequest(
        @JsonAlias("table_number") String tableNumber,
        @JsonAlias("is_active") Boolean isActive
) {}

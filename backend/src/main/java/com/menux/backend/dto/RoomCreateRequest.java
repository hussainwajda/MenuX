package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record RoomCreateRequest(
        @JsonAlias("room_number") @NotBlank String roomNumber,
        @JsonAlias("is_active") Boolean isActive
) {}

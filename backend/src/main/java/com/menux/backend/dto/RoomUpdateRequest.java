package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record RoomUpdateRequest(
        @JsonAlias("room_number") String roomNumber,
        @JsonAlias("is_active") Boolean isActive
) {}

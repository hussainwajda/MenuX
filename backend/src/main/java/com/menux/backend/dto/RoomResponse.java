package com.menux.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record RoomResponse(
        UUID id,
        String roomNumber,
        String qrCodeUrl,
        boolean isActive,
        Instant createdAt
) {}

package com.menux.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record TableResponse(
        UUID id,
        String tableNumber,
        String qrCodeUrl,
        boolean isActive,
        Instant createdAt
) {}

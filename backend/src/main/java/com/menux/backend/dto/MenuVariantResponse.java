package com.menux.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MenuVariantResponse(
        UUID id,
        UUID menuItemId,
        String name,
        BigDecimal priceDifference,
        Instant createdAt
) {}

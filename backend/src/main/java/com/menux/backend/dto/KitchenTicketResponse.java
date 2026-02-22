package com.menux.backend.dto;

import com.menux.backend.entity.KitchenTicketStatus;

import java.time.Instant;
import java.util.UUID;

public record KitchenTicketResponse(
        UUID id,
        UUID orderId,
        KitchenTicketStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}

package com.menux.backend.dto;

import com.menux.backend.entity.OrderStatus;

import java.time.Instant;
import java.util.UUID;

public record AdminOrderStatusHistoryResponse(
        UUID id,
        OrderStatus status,
        Instant updatedAt
) {
}

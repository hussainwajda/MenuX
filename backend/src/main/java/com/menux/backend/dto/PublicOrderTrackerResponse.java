package com.menux.backend.dto;

import com.menux.backend.entity.OrderPaymentStatus;
import com.menux.backend.entity.OrderStatus;
import com.menux.backend.entity.OrderType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PublicOrderTrackerResponse(
        UUID orderId,
        String restaurantName,
        UUID tableId,
        String tableNumber,
        UUID roomId,
        String roomNumber,
        OrderType orderType,
        OrderStatus status,
        OrderPaymentStatus paymentStatus,
        BigDecimal totalAmount,
        Instant createdAt,
        Integer estimatedMinutes,
        List<PublicOrderTrackerItemResponse> items,
        List<PublicOrderTrackerStatusResponse> statusHistory
) {
    public record PublicOrderTrackerItemResponse(
            UUID menuItemId,
            String menuItemName,
            UUID variantId,
            String variantName,
            Integer quantity,
            BigDecimal price,
            String instruction
    ) {}

    public record PublicOrderTrackerStatusResponse(
            OrderStatus status,
            Instant updatedAt
    ) {}
}

package com.menux.backend.dto;

import com.menux.backend.entity.OrderPaymentStatus;
import com.menux.backend.entity.OrderStatus;
import com.menux.backend.entity.OrderType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminOrderResponse(
        UUID id,
        UUID restaurantId,
        UUID tableId,
        String tableNumber,
        UUID roomId,
        String roomNumber,
        OrderType orderType,
        OrderStatus status,
        OrderPaymentStatus paymentStatus,
        BigDecimal totalAmount,
        Instant createdAt,
        List<AdminOrderItemResponse> items,
        List<AdminOrderStatusHistoryResponse> statusHistory,
        List<AdminOrderPaymentResponse> payments,
        KitchenTicketResponse kitchenTicket
) {
}

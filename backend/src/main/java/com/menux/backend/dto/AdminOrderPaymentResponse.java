package com.menux.backend.dto;

import com.menux.backend.entity.OrderPaymentRecordStatus;
import com.menux.backend.entity.PaymentGateway;

import java.time.Instant;
import java.util.UUID;

public record AdminOrderPaymentResponse(
        UUID id,
        PaymentGateway gateway,
        String transactionId,
        OrderPaymentRecordStatus status,
        Instant createdAt
) {
}

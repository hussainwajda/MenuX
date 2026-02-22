package com.menux.backend.dto;

import com.menux.backend.entity.OrderPaymentRecordStatus;
import com.menux.backend.entity.OrderPaymentStatus;
import com.menux.backend.entity.OrderStatus;

import java.util.UUID;

public record PublicOrderPaymentResponse(
        UUID orderId,
        UUID paymentId,
        OrderPaymentRecordStatus paymentRecordStatus,
        OrderPaymentStatus orderPaymentStatus,
        OrderStatus orderStatus,
        String transactionId
) {
}

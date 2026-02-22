package com.menux.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PublicCreateOrderResponse(
        UUID orderId,
        BigDecimal totalAmount,
        boolean paymentRequired
) {
}

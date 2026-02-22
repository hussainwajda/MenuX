package com.menux.backend.dto;

import com.menux.backend.entity.PaymentGateway;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PublicOrderPaymentRequest(
        @NotBlank String slug,
        UUID tableId,
        UUID roomId,
        @NotNull PaymentGateway gateway,
        Boolean simulateSuccess,
        String transactionId
) {
}

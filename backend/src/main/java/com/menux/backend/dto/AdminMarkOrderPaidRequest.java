package com.menux.backend.dto;

import com.menux.backend.entity.PaymentGateway;
import jakarta.validation.constraints.NotNull;

public record AdminMarkOrderPaidRequest(
        @NotNull PaymentGateway gateway
) {
}

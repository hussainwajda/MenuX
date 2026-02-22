package com.menux.backend.dto;

import com.menux.backend.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record AdminUpdateOrderStatusRequest(
        @NotNull OrderStatus status
) {
}

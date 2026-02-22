package com.menux.backend.dto;

import com.menux.backend.entity.KitchenTicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateKitchenTicketStatusRequest(
        @NotNull KitchenTicketStatus status
) {
}

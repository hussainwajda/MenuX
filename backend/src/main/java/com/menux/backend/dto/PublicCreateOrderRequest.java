package com.menux.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public record PublicCreateOrderRequest(
        @NotBlank String slug,
        UUID tableId,
        UUID roomId,
        @NotEmpty List<@Valid PublicCreateOrderItemRequest> items
) {
    public record PublicCreateOrderItemRequest(
            UUID menuItemId,
            UUID variantId,
            Integer quantity
    ) {
    }
}

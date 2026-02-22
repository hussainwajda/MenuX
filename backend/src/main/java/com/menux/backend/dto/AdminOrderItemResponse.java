package com.menux.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AdminOrderItemResponse(
        UUID id,
        UUID menuItemId,
        String menuItemName,
        UUID variantId,
        String variantName,
        Integer quantity,
        BigDecimal price
) {
}

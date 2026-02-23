package com.menux.backend.dto;

import java.util.UUID;

public record PublicDiningContextResponse(
        UUID restaurantId,
        String restaurantName,
        String restaurantSlug,
        String restaurantLogoUrl,
        String subscriptionPlan,
        String entityType,
        UUID entityId,
        String entityNumber,
        boolean entityActive
) {}

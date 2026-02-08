package com.menux.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record RestaurantResponse(
        UUID id,
        String name,
        String slug,
        String logoUrl,
        JsonNode themeConfig,
        SubscriptionResponse subscription,
        boolean isActive,
        Instant createdAt,
        Instant subscriptionStartedAt
) {}

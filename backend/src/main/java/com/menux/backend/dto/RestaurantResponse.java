package com.menux.backend.dto;

import com.menux.backend.entity.SubscriptionPlan;

import java.time.Instant;
import java.util.UUID;

public record RestaurantResponse(
        UUID id,
        String name,
        String logoUrl,
        String slug,
        String themeConfig,
        SubscriptionPlan subscriptionPlan,
        boolean isActive,
        Instant createdAt
) {}

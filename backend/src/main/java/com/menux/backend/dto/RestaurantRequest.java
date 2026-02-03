package com.menux.backend.dto;

import com.menux.backend.entity.SubscriptionPlan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RestaurantRequest(
        @NotBlank String name,
        String logoUrl,
        String themeConfig,
        @NotNull SubscriptionPlan subscriptionPlan,
        @NotBlank String slug
) {}

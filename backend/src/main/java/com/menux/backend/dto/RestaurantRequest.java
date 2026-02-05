package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.menux.backend.entity.SubscriptionPlan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record RestaurantRequest(
        @NotBlank String name,
        String logoUrl,
        @JsonDeserialize(using = ThemeConfigDeserializer.class)
        Map<String, Object> themeConfig,
        @NotNull SubscriptionPlan subscriptionPlan,
        @NotBlank String slug,
        @JsonProperty("isActive") Boolean isActive
) {}

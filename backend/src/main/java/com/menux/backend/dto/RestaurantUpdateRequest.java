package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.util.Map;

public record RestaurantUpdateRequest(
        String name,
        String slug,
        String logoUrl,
        Long subscriptionId,
        @JsonDeserialize(using = ThemeConfigDeserializer.class)
        Map<String, Object> themeConfig,
        @JsonProperty("isActive") Boolean isActive
) {}

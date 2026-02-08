package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record RestaurantCreateRequest(
        @NotBlank String name,
        @NotBlank String slug,
        String logoUrl,
        @NotBlank String ownerName,
        @Email @NotBlank String ownerEmail,
        String ownerPhone,
        @NotNull Long subscriptionId,
        @JsonDeserialize(using = ThemeConfigDeserializer.class)
        Map<String, Object> themeConfig,
        @JsonProperty("isActive") Boolean isActive,
        String ownerPassword
) {}

package com.menux.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.Instant;

public record SubscriptionResponse(
        Long id,
        String name,
        BigDecimal priceMonthly,
        BigDecimal priceYearly,
        Integer maxTables,
        Integer maxMenuItems,
        Integer maxAdmins,
        Boolean allowCustomDomain,
        Boolean allowQrDownload,
        Boolean allowThemeCustomization,
        Boolean allowAnalytics,
        Boolean allowOnlineOrders,
        JsonNode features,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {}

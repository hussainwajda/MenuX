package com.menux.backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.menux.backend.dto.SubscriptionDropdownResponse;
import com.menux.backend.dto.SubscriptionResponse;
import com.menux.backend.entity.Subscription;
import com.menux.backend.repository.SubscriptionRepository;
import com.menux.backend.service.AdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;
    private final AdminAuthService adminAuthService;

    @GetMapping("/subscriptions")
    public List<SubscriptionResponse> getAllSubscriptions(HttpServletRequest httpRequest) {
        adminAuthService.requireAdmin(httpRequest);
        return subscriptionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Subscription::getId))
                .map(this::mapSubscription)
                .toList();
    }

    @GetMapping("/subscription-dropdown")
    public List<SubscriptionDropdownResponse> getSubscriptionDropdown(HttpServletRequest httpRequest) {
        adminAuthService.requireAdmin(httpRequest);
        return subscriptionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Subscription::getName, String.CASE_INSENSITIVE_ORDER))
                .map(s -> new SubscriptionDropdownResponse(s.getId(), s.getName()))
                .toList();
    }

    private SubscriptionResponse mapSubscription(Subscription subscription) {
        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getName(),
                subscription.getPriceMonthly(),
                subscription.getPriceYearly(),
                subscription.getMaxTables(),
                subscription.getMaxMenuItems(),
                subscription.getMaxAdmins(),
                subscription.getAllowCustomDomain(),
                subscription.getAllowQrDownload(),
                subscription.getAllowThemeCustomization(),
                subscription.getAllowAnalytics(),
                subscription.getAllowOnlineOrders(),
                jsonToJsonNode(subscription.getFeatures()),
                subscription.isActive(),
                subscription.getCreatedAt(),
                subscription.getUpdatedAt()
        );
    }

    private JsonNode jsonToJsonNode(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}

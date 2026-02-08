package com.menux.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.menux.backend.dto.RestaurantCreateRequest;
import com.menux.backend.dto.RestaurantLoginRequest;
import com.menux.backend.dto.RestaurantLoginResponse;
import com.menux.backend.dto.RestaurantResponse;
import com.menux.backend.dto.RestaurantUpdateRequest;
import com.menux.backend.dto.SubscriptionResponse;
import com.menux.backend.entity.Restaurant;
import com.menux.backend.entity.RestaurantRole;
import com.menux.backend.entity.RestaurantUser;
import com.menux.backend.entity.Subscription;
import com.menux.backend.repository.RestaurantRepository;
import com.menux.backend.repository.RestaurantUserRepository;
import com.menux.backend.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository repository;
    private final RestaurantUserRepository restaurantUserRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SupabaseAuthService supabaseAuthService;
    private final ObjectMapper objectMapper;

    @Transactional
    public RestaurantResponse create(RestaurantCreateRequest request) {
        if (repository.existsBySlugIgnoreCase(request.slug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
        }
        if (request.ownerPassword() == null || request.ownerPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "owner_password is required");
        }

        Subscription subscription = subscriptionRepository.findById(request.subscriptionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subscription not found"));

        UUID authUserId = supabaseAuthService.createUser(
                request.ownerEmail(),
                request.ownerPassword(),
                request.ownerName(),
                request.ownerPhone()
        );

        try {
            Restaurant restaurant = Restaurant.builder()
                    .name(request.name())
                    .logoUrl(request.logoUrl())
                    .slug(request.slug())
                    .themeConfig(themeConfigToJson(request.themeConfig()))
                    .subscription(subscription)
                    .ownerName(request.ownerName())
                    .ownerEmail(request.ownerEmail())
                    .ownerPhone(request.ownerPhone())
                    .subscriptionStartedAt(Instant.now())
                    .isActive(request.isActive() != null ? request.isActive() : true)
                    .build();

            Restaurant saved = repository.save(restaurant);

            RestaurantUser restaurantUser = RestaurantUser.builder()
                    .restaurant(saved)
                    .authUserId(authUserId)
                    .role(RestaurantRole.OWNER)
                    .displayName(request.ownerName())
                    .phone(request.ownerPhone())
                    .isActive(true)
                    .build();
            restaurantUserRepository.save(restaurantUser);

            return mapToResponse(saved);
        } catch (RuntimeException ex) {
            supabaseAuthService.deleteUser(authUserId);
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public Page<RestaurantResponse> getAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getById(UUID id) {
        Restaurant restaurant = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        return mapToResponse(restaurant);
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getByIdForUser(UUID id, UUID authUserId) {
        RestaurantUser user = restaurantUserRepository.findActiveByAuthUserIdAndRestaurantId(authUserId, id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        Restaurant restaurant = user.getRestaurant();
        if (!restaurant.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found");
        }
        return mapToResponse(restaurant);
    }

    @Transactional
    public RestaurantResponse update(UUID id, RestaurantUpdateRequest request, boolean isAdmin, UUID authUserId) {
        Restaurant restaurant = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        if (!isAdmin) {
            RestaurantUser user = restaurantUserRepository.findActiveByAuthUserIdAndRestaurantId(authUserId, id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
            if (user.getRole() != RestaurantRole.OWNER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Owner role required");
            }
        }

        if (request.slug() != null && !request.slug().isBlank() && !request.slug().equalsIgnoreCase(restaurant.getSlug())) {
            if (repository.existsBySlugIgnoreCase(request.slug())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
            }
            restaurant.setSlug(request.slug());
        }

        if (request.name() != null && !request.name().isBlank()) {
            restaurant.setName(request.name());
        }
        if (request.logoUrl() != null && !request.logoUrl().isBlank()) {
            restaurant.setLogoUrl(request.logoUrl());
        }
        if (request.themeConfig() != null) {
            restaurant.setThemeConfig(themeConfigToJson(request.themeConfig()));
        }

        if (isAdmin) {
            if (request.subscriptionId() != null) {
                Subscription subscription = subscriptionRepository.findById(request.subscriptionId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subscription not found"));
                restaurant.setSubscription(subscription);
                restaurant.setSubscriptionStartedAt(Instant.now());
            }
            if (request.isActive() != null) {
                restaurant.setActive(request.isActive());
            }
        }

        return mapToResponse(repository.save(restaurant));
    }

    @Transactional
    public void deactivate(UUID id) {
        Restaurant restaurant = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        restaurant.setActive(false);
        repository.save(restaurant);
        restaurantUserRepository.deactivateByRestaurantId(id);
    }

    @Transactional(readOnly = true)
    public RestaurantLoginResponse login(RestaurantLoginRequest request) {
        SupabaseAuthService.SupabaseToken token = supabaseAuthService.signInWithPassword(
                request.email(),
                request.password()
        );
        RestaurantUser user = restaurantUserRepository.findActiveByAuthUserId(token.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Restaurant user not found"));
        if (!user.isActive() || !user.getRestaurant().isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Restaurant is disabled");
        }
        RestaurantResponse restaurantResponse = mapToResponse(user.getRestaurant());
        return new RestaurantLoginResponse(
                token.accessToken(),
                token.refreshToken(),
                user.getRole().name(),
                restaurantResponse
        );
    }

    private String themeConfigToJson(Map<String, Object> themeConfig) {
        if (themeConfig == null || themeConfig.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(themeConfig);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid themeConfig", e);
        }
    }

    private RestaurantResponse mapToResponse(Restaurant r) {
        return new RestaurantResponse(
                r.getId(),
                r.getName(),
                r.getSlug(),
                r.getLogoUrl(),
                themeConfigToJsonNode(r.getThemeConfig()),
                mapSubscription(r.getSubscription()),
                r.isActive(),
                r.getCreatedAt(),
                r.getSubscriptionStartedAt()
        );
    }

    private JsonNode themeConfigToJsonNode(String themeConfig) {
        if (themeConfig == null || themeConfig.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(themeConfig);
        } catch (JsonProcessingException e) {
            return null;
        }
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

package com.menux.backend.service;

import com.menux.backend.dto.RestaurantRequest;
import com.menux.backend.dto.RestaurantResponse;
import com.menux.backend.entity.Restaurant;
import com.menux.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository repository;

    public RestaurantResponse create(RestaurantRequest request) {
        Restaurant restaurant = Restaurant.builder()
                .name(request.name())
                .logoUrl(request.logoUrl())
                .slug(request.slug())
                .themeConfig(request.themeConfig())
                .subscriptionPlan(request.subscriptionPlan())
                .isActive(true)
                .build();

        return mapToResponse(repository.save(restaurant));
    }

    public List<RestaurantResponse> getAll() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public RestaurantResponse getById(UUID id) {
        Restaurant restaurant = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        return mapToResponse(restaurant);
    }

    public RestaurantResponse update(UUID id, RestaurantRequest request) {
        Restaurant restaurant = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setName(request.name());
        restaurant.setLogoUrl(request.logoUrl());
        restaurant.setSlug(request.slug());
        restaurant.setThemeConfig(request.themeConfig());
        restaurant.setSubscriptionPlan(request.subscriptionPlan());

        return mapToResponse(repository.save(restaurant));
    }

    public void deactivate(UUID id) {
        Restaurant restaurant = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setActive(false);
        repository.save(restaurant);
    }

    private RestaurantResponse mapToResponse(Restaurant r) {
        return new RestaurantResponse(
                r.getId(),
                r.getName(),
                r.getLogoUrl(),
                r.getSlug(),
                r.getThemeConfig(),
                r.getSubscriptionPlan(),
                r.isActive(),
                r.getCreatedAt()
        );
    }
}

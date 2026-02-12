package com.menux.backend.service;

import com.menux.backend.dto.MenuVariantCreateRequest;
import com.menux.backend.dto.MenuVariantResponse;
import com.menux.backend.dto.MenuVariantUpdateRequest;
import com.menux.backend.entity.MenuItem;
import com.menux.backend.entity.MenuVariant;
import com.menux.backend.repository.MenuItemRepository;
import com.menux.backend.repository.MenuVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuVariantService {

    private final MenuVariantRepository menuVariantRepository;
    private final MenuItemRepository menuItemRepository;

    @Transactional
    public MenuVariantResponse create(UUID restaurantId, UUID menuItemId, MenuVariantCreateRequest request) {
        MenuItem menuItem = getItemForRestaurant(restaurantId, menuItemId);

        MenuVariant variant = new MenuVariant();
        variant.setMenuItem(menuItem);
        variant.setName(request.name());
        variant.setPriceDifference(request.priceDifference());

        MenuVariant saved = menuVariantRepository.save(variant);
        return toResponse(saved);
    }

    @Transactional
    public MenuVariantResponse update(UUID restaurantId, UUID menuItemId, UUID variantId, MenuVariantUpdateRequest request) {
        getItemForRestaurant(restaurantId, menuItemId);
        MenuVariant variant = menuVariantRepository.findByIdAndMenuItemId(variantId, menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu variant not found"));

        if (request.name() != null && !request.name().isBlank()) {
            variant.setName(request.name());
        }
        if (request.priceDifference() != null) {
            variant.setPriceDifference(request.priceDifference());
        }

        MenuVariant saved = menuVariantRepository.save(variant);
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID restaurantId, UUID menuItemId, UUID variantId) {
        getItemForRestaurant(restaurantId, menuItemId);
        MenuVariant variant = menuVariantRepository.findByIdAndMenuItemId(variantId, menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu variant not found"));
        menuVariantRepository.delete(variant);
    }

    @Transactional(readOnly = true)
    public List<MenuVariantResponse> getByMenuItem(UUID restaurantId, UUID menuItemId) {
        getItemForRestaurant(restaurantId, menuItemId);
        return menuVariantRepository.findByMenuItemId(menuItemId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MenuItem getItemForRestaurant(UUID restaurantId, UUID menuItemId) {
        return menuItemRepository.findByIdAndRestaurantId(menuItemId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
    }

    private MenuVariantResponse toResponse(MenuVariant variant) {
        return new MenuVariantResponse(
                variant.getId(),
                variant.getMenuItem().getId(),
                variant.getName(),
                variant.getPriceDifference(),
                variant.getCreatedAt()
        );
    }
}

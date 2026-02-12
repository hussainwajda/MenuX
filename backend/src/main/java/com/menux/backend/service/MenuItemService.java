package com.menux.backend.service;

import com.menux.backend.dto.MenuCategoryWithItemsResponse;
import com.menux.backend.dto.MenuItemAvailabilityRequest;
import com.menux.backend.dto.MenuItemCreateRequest;
import com.menux.backend.dto.MenuItemResponse;
import com.menux.backend.dto.MenuItemUpdateRequest;
import com.menux.backend.dto.MenuItemWithVariantsResponse;
import com.menux.backend.dto.MenuVariantResponse;
import com.menux.backend.entity.MenuCategory;
import com.menux.backend.entity.MenuItem;
import com.menux.backend.entity.MenuVariant;
import com.menux.backend.entity.Restaurant;
import com.menux.backend.repository.MenuCategoryRepository;
import com.menux.backend.repository.MenuItemRepository;
import com.menux.backend.repository.MenuVariantRepository;
import com.menux.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuVariantRepository menuVariantRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public MenuItemResponse create(UUID restaurantId, MenuItemCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        MenuCategory category = menuCategoryRepository.findByIdAndRestaurantId(request.categoryId(), restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu category not found"));
        if (!category.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu category is inactive");
        }

        MenuItem item = new MenuItem();
        item.setRestaurant(restaurant);
        item.setCategory(category);
        item.setName(request.name());
        item.setDescription(request.description());
        item.setPrice(request.price());
        item.setVeg(request.isVeg() != null && request.isVeg());
        item.setAvailable(request.isAvailable() == null || request.isAvailable());
        item.setImageUrl(request.imageUrl());

        MenuItem saved = menuItemRepository.save(item);
        return toResponse(saved);
    }

    @Transactional
    public MenuItemResponse update(UUID restaurantId, UUID itemId, MenuItemUpdateRequest request) {
        MenuItem item = getItemForRestaurant(restaurantId, itemId);

        if (request.categoryId() != null) {
            MenuCategory category = menuCategoryRepository.findByIdAndRestaurantId(request.categoryId(), restaurantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu category not found"));
            if (!category.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu category is inactive");
            }
            item.setCategory(category);
        }
        if (request.name() != null && !request.name().isBlank()) {
            item.setName(request.name());
        }
        if (request.description() != null) {
            item.setDescription(request.description());
        }
        if (request.price() != null) {
            item.setPrice(request.price());
        }
        if (request.isVeg() != null) {
            item.setVeg(request.isVeg());
        }
        if (request.isAvailable() != null) {
            item.setAvailable(request.isAvailable());
        }
        if (request.imageUrl() != null) {
            item.setImageUrl(request.imageUrl());
        }

        MenuItem saved = menuItemRepository.save(item);
        return toResponse(saved);
    }

    @Transactional
    public MenuItemResponse toggleAvailability(UUID restaurantId, UUID itemId, MenuItemAvailabilityRequest request) {
        MenuItem item = getItemForRestaurant(restaurantId, itemId);
        item.setAvailable(request.isAvailable());
        MenuItem saved = menuItemRepository.save(item);
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID restaurantId, UUID itemId) {
        MenuItem item = getItemForRestaurant(restaurantId, itemId);
        menuItemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getByCategory(UUID restaurantId, UUID categoryId) {
        menuCategoryRepository.findByIdAndRestaurantId(categoryId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu category not found"));
        return menuItemRepository.findByRestaurantIdAndCategoryId(restaurantId, categoryId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuCategoryWithItemsResponse> getFullMenu(UUID restaurantId) {
        List<MenuCategory> categories = menuCategoryRepository
                .findByRestaurantIdAndIsActiveTrueOrderBySortOrderAsc(restaurantId);
        if (categories.isEmpty()) {
            return List.of();
        }

        List<UUID> categoryIds = categories.stream().map(MenuCategory::getId).toList();
        List<MenuItem> items = menuItemRepository.findByRestaurantIdAndCategoryIdIn(restaurantId, categoryIds);
        Map<UUID, List<MenuItem>> itemsByCategory = items.stream()
                .collect(Collectors.groupingBy(item -> item.getCategory().getId()));

        List<UUID> itemIds = items.stream().map(MenuItem::getId).toList();
        Map<UUID, List<MenuVariant>> variantsByItem = new HashMap<>();
        if (!itemIds.isEmpty()) {
            variantsByItem = menuVariantRepository.findByMenuItemIdIn(itemIds)
                    .stream()
                    .collect(Collectors.groupingBy(variant -> variant.getMenuItem().getId()));
        }
        final Map<UUID, List<MenuVariant>> variantsByItemFinal = variantsByItem;

        List<MenuCategoryWithItemsResponse> result = new ArrayList<>();
        for (MenuCategory category : categories) {
            List<MenuItem> categoryItems = itemsByCategory.getOrDefault(category.getId(), List.of());
            List<MenuItemWithVariantsResponse> itemResponses = categoryItems.stream()
                    .sorted(Comparator.comparing(MenuItem::getCreatedAt))
                    .map(item -> new MenuItemWithVariantsResponse(
                            item.getId(),
                            item.getName(),
                            item.getPrice(),
                            variantsByItemFinal.getOrDefault(item.getId(), List.of())
                                    .stream()
                                    .map(this::toVariantResponse)
                                    .toList()
                    ))
                    .toList();
            result.add(new MenuCategoryWithItemsResponse(
                    category.getId(),
                    category.getName(),
                    itemResponses
            ));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<MenuCategoryWithItemsResponse> getFullMenuBySlug(String slug) {
        Restaurant restaurant = restaurantRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        if (!restaurant.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found");
        }
        return getFullMenu(restaurant.getId());
    }

    @Transactional(readOnly = true)
    public MenuItem getItemForRestaurant(UUID restaurantId, UUID itemId) {
        return menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
    }

    private MenuItemResponse toResponse(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getRestaurant().getId(),
                item.getCategory().getId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.isVeg(),
                item.isAvailable(),
                item.getImageUrl(),
                item.getCreatedAt()
        );
    }

    private MenuVariantResponse toVariantResponse(MenuVariant variant) {
        return new MenuVariantResponse(
                variant.getId(),
                variant.getMenuItem().getId(),
                variant.getName(),
                variant.getPriceDifference(),
                variant.getCreatedAt()
        );
    }
}

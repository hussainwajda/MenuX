package com.menux.backend.service;

import com.menux.backend.dto.MenuCategoryCreateRequest;
import com.menux.backend.dto.MenuCategoryResponse;
import com.menux.backend.dto.MenuCategoryUpdateRequest;
import com.menux.backend.entity.MenuCategory;
import com.menux.backend.entity.Restaurant;
import com.menux.backend.repository.MenuCategoryRepository;
import com.menux.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuCategoryService {

    private final MenuCategoryRepository menuCategoryRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public MenuCategoryResponse create(UUID restaurantId, MenuCategoryCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        MenuCategory category = new MenuCategory();
        category.setRestaurant(restaurant);
        category.setName(request.name());
        category.setSortOrder(request.sortOrder());
        category.setActive(request.isActive() != null ? request.isActive() : true);

        MenuCategory saved = menuCategoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public MenuCategoryResponse update(UUID restaurantId, UUID categoryId, MenuCategoryUpdateRequest request) {
        MenuCategory category = getCategoryForRestaurant(restaurantId, categoryId);

        if (request.name() != null && !request.name().isBlank()) {
            category.setName(request.name());
        }
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }
        if (request.isActive() != null) {
            category.setActive(request.isActive());
        }

        MenuCategory saved = menuCategoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public void deactivate(UUID restaurantId, UUID categoryId) {
        MenuCategory category = getCategoryForRestaurant(restaurantId, categoryId);
        category.setActive(false);
        menuCategoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> getAllActive(UUID restaurantId) {
        return menuCategoryRepository.findByRestaurantIdAndIsActiveTrueOrderBySortOrderAsc(restaurantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MenuCategory getCategoryForRestaurant(UUID restaurantId, UUID categoryId) {
        return menuCategoryRepository.findByIdAndRestaurantId(categoryId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu category not found"));
    }

    private MenuCategoryResponse toResponse(MenuCategory category) {
        return new MenuCategoryResponse(
                category.getId(),
                category.getRestaurant().getId(),
                category.getName(),
                category.getSortOrder(),
                category.isActive(),
                category.getCreatedAt()
        );
    }
}

package com.menux.backend.controller;

import com.menux.backend.dto.MenuCategoryCreateRequest;
import com.menux.backend.dto.MenuCategoryResponse;
import com.menux.backend.dto.MenuCategoryUpdateRequest;
import com.menux.backend.service.MenuCategoryService;
import com.menux.backend.service.RestaurantAccessService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/menu-categories")
@RequiredArgsConstructor
public class MenuCategoryController {

    private final MenuCategoryService menuCategoryService;
    private final RestaurantAccessService restaurantAccessService;

    @PostMapping
    public MenuCategoryResponse create(
            @PathVariable UUID restaurantId,
            @Valid @RequestBody MenuCategoryCreateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuCategoryService.create(restaurantId, request);
    }

    @PatchMapping("/{categoryId}")
    public MenuCategoryResponse update(
            @PathVariable UUID restaurantId,
            @PathVariable UUID categoryId,
            @Valid @RequestBody MenuCategoryUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuCategoryService.update(restaurantId, categoryId, request);
    }

    @DeleteMapping("/{categoryId}")
    public void deactivate(
            @PathVariable UUID restaurantId,
            @PathVariable UUID categoryId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        menuCategoryService.deactivate(restaurantId, categoryId);
    }

    @GetMapping
    public List<MenuCategoryResponse> getAllActive(
            @PathVariable UUID restaurantId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuCategoryService.getAllActive(restaurantId);
    }
}

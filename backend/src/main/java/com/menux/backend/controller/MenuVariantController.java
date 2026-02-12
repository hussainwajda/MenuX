package com.menux.backend.controller;

import com.menux.backend.dto.MenuVariantCreateRequest;
import com.menux.backend.dto.MenuVariantResponse;
import com.menux.backend.dto.MenuVariantUpdateRequest;
import com.menux.backend.service.MenuVariantService;
import com.menux.backend.service.RestaurantAccessService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/menu-items/{menuItemId}/variants")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class MenuVariantController {

    private final MenuVariantService menuVariantService;
    private final RestaurantAccessService restaurantAccessService;

    @PostMapping
    public MenuVariantResponse create(
            @PathVariable UUID restaurantId,
            @PathVariable UUID menuItemId,
            @Valid @RequestBody MenuVariantCreateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuVariantService.create(restaurantId, menuItemId, request);
    }

    @PatchMapping("/{variantId}")
    public MenuVariantResponse update(
            @PathVariable UUID restaurantId,
            @PathVariable UUID menuItemId,
            @PathVariable UUID variantId,
            @Valid @RequestBody MenuVariantUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuVariantService.update(restaurantId, menuItemId, variantId, request);
    }

    @DeleteMapping("/{variantId}")
    public void delete(
            @PathVariable UUID restaurantId,
            @PathVariable UUID menuItemId,
            @PathVariable UUID variantId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        menuVariantService.delete(restaurantId, menuItemId, variantId);
    }

    @GetMapping
    public List<MenuVariantResponse> getByMenuItem(
            @PathVariable UUID restaurantId,
            @PathVariable UUID menuItemId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuVariantService.getByMenuItem(restaurantId, menuItemId);
    }
}

package com.menux.backend.controller;

import com.menux.backend.dto.MenuItemAvailabilityRequest;
import com.menux.backend.dto.MenuItemCreateRequest;
import com.menux.backend.dto.MenuItemResponse;
import com.menux.backend.dto.MenuItemUpdateRequest;
import com.menux.backend.service.MenuItemService;
import com.menux.backend.service.RestaurantAccessService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import com.menux.backend.service.SupabaseStorageService;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/api/restaurants/{restaurantId}/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;
    private final RestaurantAccessService restaurantAccessService;
    private final SupabaseStorageService storageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadMenuItem(
            @PathVariable UUID restaurantId,
            @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        String url = storageService.uploadMenuItemImage(restaurantId, file);
        return Map.of("image_url", url);
    }


    @PostMapping
    public MenuItemResponse create(
            @PathVariable UUID restaurantId,
            @Valid @RequestBody MenuItemCreateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuItemService.create(restaurantId, request);
    }

    @PatchMapping("/{itemId}")
    public MenuItemResponse update(
            @PathVariable UUID restaurantId,
            @PathVariable UUID itemId,
            @Valid @RequestBody MenuItemUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuItemService.update(restaurantId, itemId, request);
    }

    @PatchMapping("/{itemId}/availability")
    public MenuItemResponse toggleAvailability(
            @PathVariable UUID restaurantId,
            @PathVariable UUID itemId,
            @Valid @RequestBody MenuItemAvailabilityRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuItemService.toggleAvailability(restaurantId, itemId, request);
    }

    @DeleteMapping("/{itemId}")
    public void delete(
            @PathVariable UUID restaurantId,
            @PathVariable UUID itemId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        menuItemService.delete(restaurantId, itemId);
    }

    @GetMapping("/category/{categoryId}")
    public List<MenuItemResponse> getByCategory(
            @PathVariable UUID restaurantId,
            @PathVariable UUID categoryId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuItemService.getByCategory(restaurantId, categoryId);
    }
}

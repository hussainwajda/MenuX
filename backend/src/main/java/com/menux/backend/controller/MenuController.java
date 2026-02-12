package com.menux.backend.controller;

import com.menux.backend.dto.MenuCategoryWithItemsResponse;
import com.menux.backend.service.MenuItemService;
import com.menux.backend.service.RestaurantAccessService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/menu")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class MenuController {

    private final MenuItemService menuItemService;
    private final RestaurantAccessService restaurantAccessService;

    @GetMapping
    public List<MenuCategoryWithItemsResponse> getFullMenu(
            @PathVariable UUID restaurantId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest httpRequest
    ) {
        restaurantAccessService.requireRestaurantAccess(restaurantId, httpRequest, authorization);
        return menuItemService.getFullMenu(restaurantId);
    }
}

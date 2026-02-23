package com.menux.backend.controller;

import com.menux.backend.dto.MenuCategoryWithItemsResponse;
import com.menux.backend.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/slug/{slug}/menu")
@RequiredArgsConstructor
public class MenuPublicController {

    private final MenuItemService menuItemService;

    @GetMapping
    public List<MenuCategoryWithItemsResponse> getFullMenuBySlug(
            @PathVariable String slug
    ) {
        return menuItemService.getFullMenuBySlug(slug);
    }
}

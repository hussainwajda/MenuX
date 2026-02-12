package com.menux.backend.dto;

import java.util.List;
import java.util.UUID;

public record MenuCategoryWithItemsResponse(
        UUID categoryId,
        String categoryName,
        List<MenuItemWithVariantsResponse> items
) {}

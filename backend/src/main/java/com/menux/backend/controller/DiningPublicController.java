package com.menux.backend.controller;

import com.menux.backend.dto.PublicDiningContextResponse;
import com.menux.backend.service.RoomService;
import com.menux.backend.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants/slug/{slug}")
@RequiredArgsConstructor
public class DiningPublicController {

    private final TableService tableService;
    private final RoomService roomService;

    @GetMapping("/table/{tableId}")
    public PublicDiningContextResponse getTableContext(
            @PathVariable String slug,
            @PathVariable UUID tableId
    ) {
        return tableService.getPublicContextBySlug(slug, tableId);
    }

    @GetMapping("/room/{roomId}")
    public PublicDiningContextResponse getRoomContext(
            @PathVariable String slug,
            @PathVariable UUID roomId
    ) {
        return roomService.getPublicContextBySlug(slug, roomId);
    }
}

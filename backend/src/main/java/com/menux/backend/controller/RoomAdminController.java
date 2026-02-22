package com.menux.backend.controller;

import com.menux.backend.dto.RoomCreateRequest;
import com.menux.backend.dto.RoomResponse;
import com.menux.backend.dto.RoomUpdateRequest;
import com.menux.backend.entity.RestaurantUser;
import com.menux.backend.service.RestaurantAdminAccessService;
import com.menux.backend.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class RoomAdminController {

    private final RoomService roomService;
    private final RestaurantAdminAccessService restaurantAdminAccessService;

    @PostMapping
    public RoomResponse create(
            @Valid @RequestBody RoomCreateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return roomService.create(user.getRestaurant().getId(), request);
    }

    @GetMapping
    public List<RoomResponse> getAll(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return roomService.getAll(user.getRestaurant().getId());
    }

    @GetMapping("/{id}")
    public RoomResponse getById(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return roomService.getById(user.getRestaurant().getId(), id);
    }

    @PutMapping("/{id}")
    public RoomResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody RoomUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return roomService.update(user.getRestaurant().getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        roomService.delete(user.getRestaurant().getId(), id);
    }

    @PatchMapping("/{id}/toggle")
    public RoomResponse toggle(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return roomService.toggle(user.getRestaurant().getId(), id);
    }
}

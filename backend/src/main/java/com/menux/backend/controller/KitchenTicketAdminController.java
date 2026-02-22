package com.menux.backend.controller;

import com.menux.backend.dto.KitchenTicketResponse;
import com.menux.backend.dto.UpdateKitchenTicketStatusRequest;
import com.menux.backend.entity.RestaurantUser;
import com.menux.backend.service.OrderService;
import com.menux.backend.service.RestaurantAdminAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/kitchen-tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class KitchenTicketAdminController {

    private final OrderService orderService;
    private final RestaurantAdminAccessService restaurantAdminAccessService;

    @GetMapping
    public List<KitchenTicketResponse> getKitchenTickets(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return orderService.getKitchenTickets(user.getRestaurant().getId());
    }

    @PatchMapping("/{id}/status")
    public KitchenTicketResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateKitchenTicketStatusRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return orderService.updateKitchenTicketStatus(user.getRestaurant().getId(), id, request.status());
    }
}

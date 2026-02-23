package com.menux.backend.controller;

import com.menux.backend.dto.AdminOrderResponse;
import com.menux.backend.dto.AdminMarkOrderPaidRequest;
import com.menux.backend.dto.AdminUpdateOrderStatusRequest;
import com.menux.backend.entity.RestaurantUser;
import com.menux.backend.service.OrderService;
import com.menux.backend.service.RestaurantAdminAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class AdminOrderController {

    private final OrderService orderService;
    private final RestaurantAdminAccessService restaurantAdminAccessService;

    @GetMapping
    public List<AdminOrderResponse> getOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return orderService.getAdminOrders(user.getRestaurant().getId());
    }

    @GetMapping("/{id}")
    public AdminOrderResponse getOrder(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return orderService.getAdminOrder(user.getRestaurant().getId(), id);
    }

    @PatchMapping("/{id}/status")
    public AdminOrderResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateOrderStatusRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return orderService.updateAdminOrderStatus(user.getRestaurant().getId(), id, request.status());
    }

    @PostMapping("/{id}/mark-paid")
    public AdminOrderResponse markPaid(
            @PathVariable UUID id,
            @Valid @RequestBody AdminMarkOrderPaidRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return orderService.markAdminOrderPaid(user.getRestaurant().getId(), id, request.gateway());
    }
}

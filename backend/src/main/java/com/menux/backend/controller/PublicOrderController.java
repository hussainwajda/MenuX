package com.menux.backend.controller;

import com.menux.backend.dto.PublicCreateOrderRequest;
import com.menux.backend.dto.PublicCreateOrderResponse;
import com.menux.backend.dto.PublicOrderPaymentRequest;
import com.menux.backend.dto.PublicOrderPaymentResponse;
import com.menux.backend.dto.PublicOrderTrackerResponse;
import com.menux.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public/orders")
@RequiredArgsConstructor
public class PublicOrderController {

    private final OrderService orderService;

    @PostMapping
    public PublicCreateOrderResponse createOrder(@Valid @RequestBody PublicCreateOrderRequest request) {
        return orderService.createPublicOrder(request);
    }

    @PostMapping("/{orderId}/pay")
    public PublicOrderPaymentResponse payOrder(
            @PathVariable UUID orderId,
            @Valid @RequestBody PublicOrderPaymentRequest request
    ) {
        return orderService.payPublicOrder(orderId, request);
    }

    @GetMapping("/{orderId}")
    public PublicOrderTrackerResponse getOrder(
            @PathVariable UUID orderId,
            @RequestParam String slug,
            @RequestParam(required = false) UUID tableId,
            @RequestParam(required = false) UUID roomId
    ) {
        return orderService.getPublicOrder(orderId, slug, tableId, roomId);
    }
}

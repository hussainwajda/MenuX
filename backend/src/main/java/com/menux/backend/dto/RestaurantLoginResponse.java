package com.menux.backend.dto;

public record RestaurantLoginResponse(
        String accessToken,
        String refreshToken,
        String userRole,
        RestaurantResponse restaurant
) {}

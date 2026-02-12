package com.menux.backend.dto;

public record RestaurantLoginResponse(
        String accessToken,
        String refreshToken,
        Long expiresIn,
        String userRole,
        RestaurantResponse restaurant
) {}

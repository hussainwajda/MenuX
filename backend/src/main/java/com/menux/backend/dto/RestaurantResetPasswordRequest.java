package com.menux.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RestaurantResetPasswordRequest(
        @NotBlank String accessToken,
        @NotBlank @Size(min = 8, max = 128) String newPassword
) {}

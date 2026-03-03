package com.menux.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RestaurantForgotPasswordRequest(
        @Email @NotBlank String email,
        String redirectTo
) {}

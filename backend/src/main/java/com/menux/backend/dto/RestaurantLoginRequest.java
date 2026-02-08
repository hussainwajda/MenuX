package com.menux.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RestaurantLoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
) {}

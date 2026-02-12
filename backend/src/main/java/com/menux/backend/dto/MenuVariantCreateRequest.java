package com.menux.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record MenuVariantCreateRequest(
        @NotBlank String name,
        @JsonAlias("price_difference") @PositiveOrZero BigDecimal priceDifference
) {}

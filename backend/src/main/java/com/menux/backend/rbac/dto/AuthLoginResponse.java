package com.menux.backend.rbac.dto;

import java.util.List;
import java.util.UUID;

public record AuthLoginResponse(
        String token,
        UUID userId,
        UUID restaurantId,
        String roleName,
        List<String> permissions,
        String userName,
        String email
) {
}

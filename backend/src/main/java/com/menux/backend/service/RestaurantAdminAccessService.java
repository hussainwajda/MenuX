package com.menux.backend.service;

import com.menux.backend.entity.RestaurantRole;
import com.menux.backend.entity.RestaurantUser;
import com.menux.backend.repository.RestaurantUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.EnumSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantAdminAccessService {

    private static final EnumSet<RestaurantRole> ADMIN_ROLES = EnumSet.of(RestaurantRole.OWNER, RestaurantRole.MANAGER);

    private final SupabaseAuthService supabaseAuthService;
    private final RestaurantUserRepository restaurantUserRepository;

    public RestaurantUser requireRestaurantAdmin(String authorization) {
        String accessToken = extractBearerToken(authorization);
        UUID authUserId = supabaseAuthService.getUserIdFromAccessToken(accessToken);
        RestaurantUser user = restaurantUserRepository.findActiveByAuthUserId(authUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        if (!ADMIN_ROLES.contains(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role required");
        }
        if (!user.getRestaurant().isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Restaurant is disabled");
        }
        return user;
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization bearer token required");
        }
        return authorization.substring("Bearer ".length());
    }
}

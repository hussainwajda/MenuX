package com.menux.backend.service;

import com.menux.backend.repository.RestaurantUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantAccessService {

    private final AdminAuthService adminAuthService;
    private final SupabaseAuthService supabaseAuthService;
    private final RestaurantUserRepository restaurantUserRepository;

    public void requireRestaurantAccess(UUID restaurantId, HttpServletRequest httpRequest, String authorization) {
        if (adminAuthService.isAdmin(httpRequest)) {
            return;
        }
        String accessToken = extractBearerToken(authorization);
        UUID authUserId = supabaseAuthService.getUserIdFromAccessToken(accessToken);
        restaurantUserRepository.findActiveByAuthUserIdAndRestaurantId(authUserId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization bearer token required");
        }
        return authorization.substring("Bearer ".length());
    }
}

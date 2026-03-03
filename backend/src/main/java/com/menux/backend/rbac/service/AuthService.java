package com.menux.backend.rbac.service;

import com.menux.backend.entity.RestaurantRole;
import com.menux.backend.entity.RestaurantUser;
import com.menux.backend.rbac.dto.AuthLoginRequest;
import com.menux.backend.rbac.dto.AuthLoginResponse;
import com.menux.backend.rbac.entity.Permission;
import com.menux.backend.rbac.entity.RbacUser;
import com.menux.backend.rbac.entity.Role;
import com.menux.backend.rbac.exception.RbacUnauthorizedException;
import com.menux.backend.rbac.repository.PermissionRepository;
import com.menux.backend.rbac.repository.RbacUserRepository;
import com.menux.backend.rbac.repository.RoleRepository;
import com.menux.backend.rbac.security.JwtTokenProvider;
import com.menux.backend.rbac.security.RbacPrincipal;
import com.menux.backend.repository.RestaurantUserRepository;
import com.menux.backend.service.SupabaseAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RbacUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SupabaseAuthService supabaseAuthService;
    private final RestaurantUserRepository restaurantUserRepository;
    private final PermissionCatalogService permissionCatalogService;

    @Transactional(readOnly = true)
    public AuthLoginResponse login(AuthLoginRequest request) {
        RbacUser user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new RbacUnauthorizedException("Invalid email or password"));

        if (!user.isActive() || user.isDeleted()) {
            throw new RbacUnauthorizedException("User is inactive");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RbacUnauthorizedException("Invalid email or password");
        }

        Role role = roleRepository.findByIdAndRestaurantId(user.getRoleId(), user.getRestaurantId())
                .orElseThrow(() -> new RbacUnauthorizedException("Role not found"));

        List<String> permissions = permissionRepository.findAllByRole_Id(role.getId()).stream()
                .map(Permission::getPermissionKey)
                .toList();

        RbacPrincipal principal = RbacPrincipal.builder()
                .userId(user.getId())
                .restaurantId(user.getRestaurantId())
                .email(user.getEmail())
                .password(user.getPassword())
                .roleName(role.getName())
                .permissions(permissions)
                .active(user.isActive())
                .build();

        String token = jwtTokenProvider.generateToken(principal);
        return new AuthLoginResponse(
                token,
                principal.userId(),
                principal.restaurantId(),
                principal.roleName(),
                principal.permissions(),
                user.getName(),
                user.getEmail()
        );
    }

    @Transactional(readOnly = true)
    public AuthLoginResponse ownerSessionFromRestaurantAccessToken(String authorizationHeader) {
        String accessToken = extractBearerToken(authorizationHeader);
        UUID authUserId = supabaseAuthService.getUserIdFromAccessToken(accessToken);

        RestaurantUser restaurantUser = restaurantUserRepository.findActiveByAuthUserId(authUserId)
                .orElseThrow(() -> new RbacUnauthorizedException("Restaurant user not found"));

        if (!restaurantUser.isActive() || !restaurantUser.getRestaurant().isActive()) {
            throw new RbacUnauthorizedException("Restaurant is disabled");
        }

        if (restaurantUser.getRole() != RestaurantRole.OWNER) {
            throw new RbacUnauthorizedException("Owner access required");
        }

        List<String> permissions = permissionCatalogService.ownerDefaultPermissions();
        String email = restaurantUser.getRestaurant().getOwnerEmail();
        String userName = restaurantUser.getDisplayName() != null && !restaurantUser.getDisplayName().isBlank()
                ? restaurantUser.getDisplayName()
                : restaurantUser.getRestaurant().getOwnerName();
        String roleName = "Owner";

        RbacPrincipal principal = RbacPrincipal.builder()
                .userId(restaurantUser.getId())
                .restaurantId(restaurantUser.getRestaurant().getId())
                .email(email != null ? email : authUserId + "@owner.local")
                .password("")
                .roleName(roleName)
                .permissions(permissions)
                .active(true)
                .build();

        String token = jwtTokenProvider.generateToken(principal);
        return new AuthLoginResponse(
                token,
                principal.userId(),
                principal.restaurantId(),
                principal.roleName(),
                principal.permissions(),
                userName,
                principal.email()
        );
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RbacUnauthorizedException("Authorization bearer token required");
        }
        return authorizationHeader.substring("Bearer ".length());
    }
}

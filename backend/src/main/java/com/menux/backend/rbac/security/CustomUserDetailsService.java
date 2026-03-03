package com.menux.backend.rbac.security;

import com.menux.backend.rbac.entity.Permission;
import com.menux.backend.rbac.entity.RbacUser;
import com.menux.backend.rbac.entity.Role;
import com.menux.backend.rbac.exception.RbacUnauthorizedException;
import com.menux.backend.rbac.repository.PermissionRepository;
import com.menux.backend.rbac.repository.RbacUserRepository;
import com.menux.backend.rbac.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final RbacUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        RbacUser user = userRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new RbacUnauthorizedException("Invalid email or password"));

        Role role = roleRepository.findByIdAndRestaurantId(user.getRoleId(), user.getRestaurantId())
                .orElseThrow(() -> new RbacUnauthorizedException("User role not found"));

        List<String> permissions = permissionRepository.findAllByRole_Id(role.getId())
                .stream()
                .map(Permission::getPermissionKey)
                .toList();

        return RbacPrincipal.builder()
                .userId(user.getId())
                .restaurantId(user.getRestaurantId())
                .email(user.getEmail())
                .password(user.getPassword())
                .roleName(role.getName())
                .permissions(permissions)
                .active(user.isActive())
                .build();
    }
}

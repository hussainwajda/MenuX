package com.menux.backend.rbac.service;

import com.menux.backend.rbac.dto.UserCreateRequest;
import com.menux.backend.rbac.dto.UserResponse;
import com.menux.backend.rbac.dto.UserStatusRequest;
import com.menux.backend.rbac.dto.UserUpdateRequest;
import com.menux.backend.rbac.entity.RbacUser;
import com.menux.backend.rbac.entity.Role;
import com.menux.backend.rbac.exception.RbacBadRequestException;
import com.menux.backend.rbac.exception.RbacNotFoundException;
import com.menux.backend.rbac.repository.RbacUserRepository;
import com.menux.backend.rbac.repository.RoleRepository;
import com.menux.backend.rbac.security.RbacPrincipal;
import com.menux.backend.rbac.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final RbacUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        UUID restaurantId = SecurityUtils.currentPrincipal().restaurantId();
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new RbacBadRequestException("Email already in use");
        }

        Role role = roleService.findRoleInTenant(request.roleId(), restaurantId);
        RbacUser user = new RbacUser();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRoleId(role.getId());
        user.setRestaurantId(restaurantId);
        user.setActive(request.isActive() == null || request.isActive());

        RbacUser saved = userRepository.save(user);
        return toResponse(saved, role.getName());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        UUID restaurantId = SecurityUtils.currentPrincipal().restaurantId();
        List<RbacUser> users = userRepository.findAllByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        List<UUID> roleIds = users.stream().map(RbacUser::getRoleId).distinct().toList();
        Map<UUID, String> roleNames = roleRepository.findAllById(roleIds).stream()
                .collect(Collectors.toMap(Role::getId, Role::getName));

        return users.stream()
                .map(user -> toResponse(user, roleNames.getOrDefault(user.getRoleId(), "Unknown")))
                .toList();
    }

    @Transactional
    public UserResponse updateUser(UUID userId, UserUpdateRequest request) {
        UUID restaurantId = SecurityUtils.currentPrincipal().restaurantId();
        RbacUser user = userRepository.findByIdAndRestaurantId(userId, restaurantId)
                .orElseThrow(() -> new RbacNotFoundException("User not found"));

        String normalizedEmail = request.email().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(normalizedEmail) && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new RbacBadRequestException("Email already in use");
        }
        Role role = roleService.findRoleInTenant(request.roleId(), restaurantId);

        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setRoleId(role.getId());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.isActive() != null) {
            user.setActive(request.isActive());
        }

        return toResponse(userRepository.save(user), role.getName());
    }

    @Transactional
    public UserResponse updateStatus(UUID userId, UserStatusRequest request) {
        UUID restaurantId = SecurityUtils.currentPrincipal().restaurantId();
        RbacUser user = userRepository.findByIdAndRestaurantId(userId, restaurantId)
                .orElseThrow(() -> new RbacNotFoundException("User not found"));

        user.setActive(request.isActive());
        Role role = roleRepository.findByIdAndRestaurantId(user.getRoleId(), restaurantId)
                .orElseThrow(() -> new RbacNotFoundException("Role not found"));
        return toResponse(userRepository.save(user), role.getName());
    }

    @Transactional
    public void deleteUser(UUID userId) {
        UUID restaurantId = SecurityUtils.currentPrincipal().restaurantId();
        RbacPrincipal principal = SecurityUtils.currentPrincipal();
        if (principal.userId().equals(userId)) {
            throw new RbacBadRequestException("You cannot delete your own account");
        }
        RbacUser user = userRepository.findByIdAndRestaurantId(userId, restaurantId)
                .orElseThrow(() -> new RbacNotFoundException("User not found"));
        userRepository.delete(user);
    }

    private UserResponse toResponse(RbacUser user, String roleName) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRoleId(),
                roleName,
                user.getRestaurantId(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}

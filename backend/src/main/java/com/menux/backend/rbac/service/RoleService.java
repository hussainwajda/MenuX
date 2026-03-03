package com.menux.backend.rbac.service;

import com.menux.backend.rbac.dto.RoleCreateRequest;
import com.menux.backend.rbac.dto.RoleResponse;
import com.menux.backend.rbac.dto.RoleUpdateRequest;
import com.menux.backend.rbac.entity.Permission;
import com.menux.backend.rbac.entity.Role;
import com.menux.backend.rbac.exception.RbacBadRequestException;
import com.menux.backend.rbac.exception.RbacNotFoundException;
import com.menux.backend.rbac.repository.PermissionRepository;
import com.menux.backend.rbac.repository.RbacUserRepository;
import com.menux.backend.rbac.repository.RoleRepository;
import com.menux.backend.rbac.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RbacUserRepository userRepository;
    private final PermissionCatalogService permissionCatalogService;

    @Transactional
    public RoleResponse createRole(RoleCreateRequest request) {
        UUID restaurantId = SecurityUtils.currentPrincipal().restaurantId();
        if (roleRepository.existsByNameIgnoreCaseAndRestaurantId(request.name(), restaurantId)) {
            throw new RbacBadRequestException("Role name already exists");
        }
        permissionCatalogService.validatePermissionKeys(request.permissionKeys());

        Role role = new Role();
        role.setName(request.name().trim());
        role.setDescription(request.description());
        role.setRestaurantId(restaurantId);
        Role savedRole = roleRepository.save(role);
        savePermissions(savedRole, request.permissionKeys());

        return toResponse(savedRole, request.permissionKeys());
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> listRoles() {
        UUID restaurantId = SecurityUtils.currentPrincipal().restaurantId();
        List<Role> roles = roleRepository.findAllByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        List<UUID> roleIds = roles.stream().map(Role::getId).toList();

        Map<UUID, List<String>> permissionsByRole = permissionRepository.findAllByRole_IdIn(roleIds).stream()
                .collect(Collectors.groupingBy(
                        p -> p.getRole().getId(),
                        Collectors.mapping(Permission::getPermissionKey, Collectors.toList())
                ));

        return roles.stream()
                .map(role -> toResponse(role, permissionsByRole.getOrDefault(role.getId(), List.of())))
                .toList();
    }

    @Transactional
    public RoleResponse updateRole(UUID roleId, RoleUpdateRequest request) {
        UUID restaurantId = SecurityUtils.currentPrincipal().restaurantId();
        Role role = roleRepository.findByIdAndRestaurantId(roleId, restaurantId)
                .orElseThrow(() -> new RbacNotFoundException("Role not found"));
        permissionCatalogService.validatePermissionKeys(request.permissionKeys());

        if (!role.getName().equalsIgnoreCase(request.name())
                && roleRepository.existsByNameIgnoreCaseAndRestaurantId(request.name(), restaurantId)) {
            throw new RbacBadRequestException("Role name already exists");
        }

        role.setName(request.name().trim());
        role.setDescription(request.description());
        Role saved = roleRepository.save(role);
        permissionRepository.deleteByRole_Id(saved.getId());
        savePermissions(saved, request.permissionKeys());

        return toResponse(saved, request.permissionKeys());
    }

    @Transactional
    public void deleteRole(UUID roleId) {
        UUID restaurantId = SecurityUtils.currentPrincipal().restaurantId();
        Role role = roleRepository.findByIdAndRestaurantId(roleId, restaurantId)
                .orElseThrow(() -> new RbacNotFoundException("Role not found"));

        long usersUsingRole = userRepository.countByRoleIdAndRestaurantId(roleId, restaurantId);
        if (usersUsingRole > 0) {
            throw new RbacBadRequestException("Cannot delete role assigned to active users");
        }

        permissionRepository.deleteByRole_Id(role.getId());
        roleRepository.delete(role);
    }

    @Transactional(readOnly = true)
    public Role findRoleInTenant(UUID roleId, UUID restaurantId) {
        return roleRepository.findByIdAndRestaurantId(roleId, restaurantId)
                .orElseThrow(() -> new RbacBadRequestException("Role does not belong to this restaurant"));
    }

    private void savePermissions(Role role, List<String> permissionKeys) {
        List<Permission> permissions = new ArrayList<>();
        for (String key : permissionKeys) {
            Permission permission = new Permission();
            permission.setRole(role);
            permission.setPermissionKey(key);
            permissions.add(permission);
        }
        permissionRepository.saveAll(permissions);
    }

    private RoleResponse toResponse(Role role, List<String> permissions) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getRestaurantId(),
                permissions,
                role.getCreatedAt()
        );
    }
}

package com.menux.backend.rbac.service;

import com.menux.backend.rbac.dto.PermissionModulesResponse;
import com.menux.backend.rbac.exception.RbacBadRequestException;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PermissionCatalogService {

    private static final List<String> AVAILABLE_PERMISSIONS = List.of(
            "orders.view",
            "orders.create",
            "orders.update",
            "orders.delete",
            "tables.view",
            "menu.edit",
            "reports.view",
            "users.manage"
    );

    public PermissionModulesResponse getGroupedPermissionModules() {
        Map<String, List<String>> grouped = AVAILABLE_PERMISSIONS.stream()
                .sorted(Comparator.naturalOrder())
                .collect(Collectors.groupingBy(
                        key -> key.split("\\.")[0],
                        LinkedHashMap::new,
                        Collectors.toList()
                ));
        return new PermissionModulesResponse(grouped);
    }

    public void validatePermissionKeys(List<String> keys) {
        List<String> invalid = keys.stream()
                .filter(key -> !AVAILABLE_PERMISSIONS.contains(key))
                .toList();
        if (!invalid.isEmpty()) {
            throw new RbacBadRequestException("Invalid permission keys: " + String.join(", ", invalid));
        }
    }

    public List<String> ownerDefaultPermissions() {
        return AVAILABLE_PERMISSIONS;
    }
}

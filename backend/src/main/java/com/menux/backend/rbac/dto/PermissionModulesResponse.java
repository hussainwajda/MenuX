package com.menux.backend.rbac.dto;

import java.util.List;
import java.util.Map;

public record PermissionModulesResponse(
        Map<String, List<String>> modules
) {
}

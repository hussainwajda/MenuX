package com.menux.backend.rbac.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component("rbacPermissionEvaluator")
public class RbacPermissionEvaluator implements PermissionEvaluator {

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || permission == null) {
            return false;
        }
        if (!(authentication.getPrincipal() instanceof RbacPrincipal principal)) {
            return false;
        }
        String required = permission.toString();
        return principal.permissions().stream().anyMatch(required::equalsIgnoreCase);
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return hasPermission(authentication, targetType, permission);
    }
}

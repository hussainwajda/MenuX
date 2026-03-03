package com.menux.backend.rbac.security;

import com.menux.backend.rbac.exception.RbacUnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static RbacPrincipal currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof RbacPrincipal principal)) {
            throw new RbacUnauthorizedException("Unauthorized");
        }
        return principal;
    }
}

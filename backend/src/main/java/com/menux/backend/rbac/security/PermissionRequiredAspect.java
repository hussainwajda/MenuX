package com.menux.backend.rbac.security;

import com.menux.backend.rbac.exception.RbacAccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class PermissionRequiredAspect {

    private final RbacPermissionEvaluator permissionEvaluator;

    @Before("@annotation(permissionRequired)")
    public void validatePermission(PermissionRequired permissionRequired) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean allowed = permissionEvaluator.hasPermission(authentication, null, permissionRequired.value());
        if (!allowed) {
            throw new RbacAccessDeniedException("Forbidden: missing permission " + permissionRequired.value());
        }
    }
}

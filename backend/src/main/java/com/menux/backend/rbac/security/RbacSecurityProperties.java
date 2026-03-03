package com.menux.backend.rbac.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rbac.security")
public record RbacSecurityProperties(
        String jwtSecret,
        Long jwtExpirationMs
) {
}

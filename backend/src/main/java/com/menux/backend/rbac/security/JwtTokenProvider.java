package com.menux.backend.rbac.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtTokenProvider(RbacSecurityProperties securityProperties) {
        this.signingKey = Keys.hmacShaKeyFor(securityProperties.jwtSecret().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = securityProperties.jwtExpirationMs();
    }

    public String generateToken(RbacPrincipal principal) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(expirationMs);

        return Jwts.builder()
                .subject(principal.email())
                .claim("userId", principal.userId().toString())
                .claim("restaurantId", principal.restaurantId().toString())
                .claim("role", principal.roleName())
                .claim("permissions", principal.permissions())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    public boolean isTokenValid(String token) {
        Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token);
        return true;
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        @SuppressWarnings("unchecked")
        List<String> permissions = (List<String>) claims.get("permissions");

        RbacPrincipal principal = RbacPrincipal.builder()
                .userId(UUID.fromString(claims.get("userId", String.class)))
                .restaurantId(UUID.fromString(claims.get("restaurantId", String.class)))
                .email(claims.getSubject())
                .password("")
                .roleName(claims.get("role", String.class))
                .permissions(permissions == null ? List.of() : permissions)
                .active(true)
                .build();

        return new UsernamePasswordAuthenticationToken(principal, token, principal.getAuthorities());
    }
}

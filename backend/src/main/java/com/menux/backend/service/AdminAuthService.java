package com.menux.backend.service;

import com.menux.backend.entity.Admin;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminService adminService;

    public void requireAdmin(HttpServletRequest request) {
        if (!isAdmin(request)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin authentication required");
        }
    }

    public boolean isAdmin(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Basic ")) {
            return false;
        }
        String encoded = header.substring("Basic ".length());
        String decoded = new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
        int idx = decoded.indexOf(':');
        if (idx <= 0) {
            return false;
        }
        String username = decoded.substring(0, idx);
        String password = decoded.substring(idx + 1);
        Admin admin = adminService.login(username, password);
        return admin != null;
    }
}

package com.menux.backend.service;

import com.menux.backend.entity.Admin;
import com.menux.backend.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Admin login(String username, String password) {
        Admin admin = adminRepository.findByUsername(username);
        if (admin == null && adminRepository.count() == 0) {
            // Bootstrap first admin user if none exist
            admin = createAdmin(username, password);
        }
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            return admin;
        }
        return null;
    }

    public Admin createAdmin(String username, String password) {
        Admin admin = Admin.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .build();
        return adminRepository.save(admin);
    }
}

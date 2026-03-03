package com.menux.backend.rbac.repository;

import com.menux.backend.rbac.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByIdAndRestaurantId(UUID id, UUID restaurantId);

    List<Role> findAllByRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);

    boolean existsByNameIgnoreCaseAndRestaurantId(String name, UUID restaurantId);
}

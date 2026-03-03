package com.menux.backend.rbac.repository;

import com.menux.backend.rbac.entity.RbacUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RbacUserRepository extends JpaRepository<RbacUser, UUID> {
    Optional<RbacUser> findByEmailIgnoreCase(String email);

    Optional<RbacUser> findByIdAndRestaurantId(UUID id, UUID restaurantId);

    List<RbacUser> findAllByRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);

    boolean existsByEmailIgnoreCase(String email);

    long countByRoleIdAndRestaurantId(UUID roleId, UUID restaurantId);
}

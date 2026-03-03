package com.menux.backend.rbac.repository;

import com.menux.backend.rbac.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    List<Permission> findAllByRole_Id(UUID roleId);

    List<Permission> findAllByRole_IdIn(Collection<UUID> roleIds);

    void deleteByRole_Id(UUID roleId);
}

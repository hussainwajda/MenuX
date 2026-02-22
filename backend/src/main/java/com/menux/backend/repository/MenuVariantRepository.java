package com.menux.backend.repository;

import com.menux.backend.entity.MenuVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MenuVariantRepository extends JpaRepository<MenuVariant, UUID> {
    List<MenuVariant> findByMenuItemId(UUID menuItemId);

    List<MenuVariant> findByMenuItemIdIn(Collection<UUID> menuItemIds);

    List<MenuVariant> findByIdIn(Collection<UUID> ids);

    Optional<MenuVariant> findByIdAndMenuItemId(UUID id, UUID menuItemId);
}

package com.menux.backend.repository;

import com.menux.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RestaurantRepository
        extends JpaRepository<Restaurant, UUID> {
    boolean existsBySlugIgnoreCase(String slug);
    Optional<Restaurant> findBySlugIgnoreCase(String slug);
}

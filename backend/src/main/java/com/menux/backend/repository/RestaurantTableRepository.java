package com.menux.backend.repository;

import com.menux.backend.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, UUID> {
    List<RestaurantTable> findByRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);

    Optional<RestaurantTable> findByIdAndRestaurantId(UUID id, UUID restaurantId);

    boolean existsByRestaurantIdAndTableNumberIgnoreCase(UUID restaurantId, String tableNumber);

    boolean existsByRestaurantIdAndTableNumberIgnoreCaseAndIdNot(UUID restaurantId, String tableNumber, UUID id);
}

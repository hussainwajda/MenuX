package com.menux.backend.repository;

import com.menux.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findByRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);

    Optional<Room> findByIdAndRestaurantId(UUID id, UUID restaurantId);

    boolean existsByRestaurantIdAndRoomNumberIgnoreCase(UUID restaurantId, String roomNumber);

    boolean existsByRestaurantIdAndRoomNumberIgnoreCaseAndIdNot(UUID restaurantId, String roomNumber, UUID id);
}

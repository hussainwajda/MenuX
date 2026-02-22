package com.menux.backend.repository;

import com.menux.backend.entity.KitchenTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KitchenTicketRepository extends JpaRepository<KitchenTicket, UUID> {
    Optional<KitchenTicket> findByOrderId(UUID orderId);

    Optional<KitchenTicket> findByIdAndOrderRestaurantId(UUID id, UUID restaurantId);

    List<KitchenTicket> findByOrderRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);

    List<KitchenTicket> findByOrderIdIn(List<UUID> orderIds);
}

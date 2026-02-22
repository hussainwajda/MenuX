package com.menux.backend.repository;

import com.menux.backend.entity.CustomerOrder;
import com.menux.backend.entity.OrderPaymentStatus;
import com.menux.backend.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, UUID> {
    Optional<CustomerOrder> findByIdAndRestaurantId(UUID id, UUID restaurantId);

    List<CustomerOrder> findByRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);

    List<CustomerOrder> findByStatusAndPaymentStatusAndCreatedAtBefore(
            OrderStatus status,
            OrderPaymentStatus paymentStatus,
            Instant createdAt
    );

    List<CustomerOrder> findByIdIn(Collection<UUID> ids);
}

package com.menux.backend.repository;

import com.menux.backend.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, UUID> {
    List<OrderStatusHistory> findByOrderIdOrderByUpdatedAtAsc(UUID orderId);

    List<OrderStatusHistory> findByOrderIdInOrderByUpdatedAtAsc(Collection<UUID> orderIds);
}

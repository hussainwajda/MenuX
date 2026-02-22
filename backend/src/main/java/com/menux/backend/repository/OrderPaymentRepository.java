package com.menux.backend.repository;

import com.menux.backend.entity.OrderPayment;
import com.menux.backend.entity.OrderPaymentRecordStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface OrderPaymentRepository extends JpaRepository<OrderPayment, UUID> {
    List<OrderPayment> findByOrderIdOrderByCreatedAtAsc(UUID orderId);

    List<OrderPayment> findByOrderIdInOrderByCreatedAtAsc(Collection<UUID> orderIds);

    boolean existsByOrderIdAndStatus(UUID orderId, OrderPaymentRecordStatus status);
}

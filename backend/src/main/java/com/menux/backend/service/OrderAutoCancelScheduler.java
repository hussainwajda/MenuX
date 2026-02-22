package com.menux.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderAutoCancelScheduler {

    private final OrderService orderService;

    @Scheduled(fixedDelay = 300000)
    public void cancelStaleUnpaidOrders() {
        int cancelled = orderService.autoCancelUnpaidOrdersOlderThan90Minutes();
        if (cancelled > 0) {
            log.info("Auto-cancelled {} unpaid pending orders older than 90 minutes", cancelled);
        }
    }
}

package com.menux.backend.service;

import com.menux.backend.dto.*;
import com.menux.backend.entity.*;
import com.menux.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final RoomRepository roomRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuVariantRepository menuVariantRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final KitchenTicketRepository kitchenTicketRepository;

    @Transactional
    public PublicCreateOrderResponse createPublicOrder(PublicCreateOrderRequest request) {
        Restaurant restaurant = getActiveRestaurantBySlug(request.slug());
        requireOrderingAllowed(restaurant);
        OrderSource source = resolveOrderSourceForPublic(restaurant, request.tableId(), request.roomId());

        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one item is required");
        }

        List<UUID> itemIds = request.items().stream()
                .map(PublicCreateOrderRequest.PublicCreateOrderItemRequest::menuItemId)
                .filter(Objects::nonNull)
                .toList();
        if (itemIds.size() != request.items().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "menuItemId is required for all items");
        }

        List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndIdIn(restaurant.getId(), itemIds);
        if (menuItems.size() != new HashSet<>(itemIds).size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more items do not belong to this restaurant");
        }
        Map<UUID, MenuItem> menuItemsById = menuItems.stream()
                .collect(Collectors.toMap(MenuItem::getId, Function.identity()));

        List<UUID> variantIds = request.items().stream()
                .map(PublicCreateOrderRequest.PublicCreateOrderItemRequest::variantId)
                .filter(Objects::nonNull)
                .toList();
        Map<UUID, MenuVariant> variantsById = variantIds.isEmpty()
                ? Map.of()
                : menuVariantRepository.findByIdIn(variantIds).stream()
                .collect(Collectors.toMap(MenuVariant::getId, Function.identity()));

        CustomerOrder order = new CustomerOrder();
        order.setRestaurant(restaurant);
        order.setTable(source.table());
        order.setRoom(source.room());
        order.setOrderType(source.orderType());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(OrderPaymentStatus.UNPAID);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (PublicCreateOrderRequest.PublicCreateOrderItemRequest requestedItem : request.items()) {
            MenuItem menuItem = menuItemsById.get(requestedItem.menuItemId());
            if (menuItem == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu item not found");
            }
            if (!menuItem.isAvailable()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu item is unavailable: " + menuItem.getName());
            }

            int quantity = requestedItem.quantity() == null ? 0 : requestedItem.quantity();
            if (quantity <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero");
            }

            MenuVariant variant = null;
            BigDecimal unitPrice = menuItem.getPrice();
            if (requestedItem.variantId() != null) {
                variant = variantsById.get(requestedItem.variantId());
                if (variant == null || !variant.getMenuItem().getId().equals(menuItem.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid variant for menu item");
                }
                if (variant.getPriceDifference() != null) {
                    unitPrice = unitPrice.add(variant.getPriceDifference());
                }
            }

            if (unitPrice.compareTo(BigDecimal.ZERO) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Calculated item price cannot be negative");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setVariant(variant);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(unitPrice);
            orderItems.add(orderItem);

            total = total.add(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        }

        order.setTotalAmount(total);
        CustomerOrder savedOrder = customerOrderRepository.save(order);

        for (OrderItem orderItem : orderItems) {
            orderItem.setOrder(savedOrder);
        }
        orderItemRepository.saveAll(orderItems);

        appendStatusHistory(savedOrder, OrderStatus.PENDING);
        createKitchenTicket(savedOrder);

        return new PublicCreateOrderResponse(savedOrder.getId(), total, total.compareTo(BigDecimal.ZERO) > 0);
    }

    @Transactional
    public PublicOrderPaymentResponse payPublicOrder(UUID orderId, PublicOrderPaymentRequest request) {
        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        Restaurant restaurant = getActiveRestaurantBySlug(request.slug());
        requireOrderingAllowed(restaurant);

        if (!order.getRestaurant().getId().equals(restaurant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order does not belong to this restaurant");
        }
        validateOrderOwnership(order, request.tableId(), request.roomId());

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.SERVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment not allowed for this order status");
        }
        if (order.getPaymentStatus() == OrderPaymentStatus.PAID
                || orderPaymentRepository.existsByOrderIdAndStatus(orderId, OrderPaymentRecordStatus.SUCCESS)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Order is already paid");
        }

        boolean simulatedSuccess = request.simulateSuccess() == null || request.simulateSuccess();
        OrderPayment payment = new OrderPayment();
        payment.setOrder(order);
        payment.setGateway(request.gateway());
        payment.setStatus(simulatedSuccess ? OrderPaymentRecordStatus.SUCCESS : OrderPaymentRecordStatus.FAILED);
        payment.setTransactionId(resolveTransactionId(request.gateway(), request.transactionId(), simulatedSuccess));
        OrderPayment savedPayment = orderPaymentRepository.save(payment);

        if (simulatedSuccess) {
            order.setPaymentStatus(OrderPaymentStatus.PAID);
            customerOrderRepository.save(order);

            if (order.getStatus() == OrderStatus.PENDING) {
                changeOrderStatusInternal(order, OrderStatus.ACCEPTED);
            }
        }

        return new PublicOrderPaymentResponse(
                order.getId(),
                savedPayment.getId(),
                savedPayment.getStatus(),
                order.getPaymentStatus(),
                order.getStatus(),
                savedPayment.getTransactionId()
        );
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getAdminOrders(UUID restaurantId) {
        List<CustomerOrder> orders = customerOrderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        return enrichOrders(orders);
    }

    @Transactional(readOnly = true)
    public AdminOrderResponse getAdminOrder(UUID restaurantId, UUID orderId) {
        CustomerOrder order = getOrderForRestaurant(restaurantId, orderId);
        return enrichOrders(List.of(order)).get(0);
    }

    @Transactional
    public AdminOrderResponse updateAdminOrderStatus(UUID restaurantId, UUID orderId, OrderStatus nextStatus) {
        CustomerOrder order = getOrderForRestaurant(restaurantId, orderId);
        validateStatusTransition(order.getStatus(), nextStatus);
        changeOrderStatusInternal(order, nextStatus);
        return getAdminOrder(restaurantId, orderId);
    }

    @Transactional(readOnly = true)
    public List<KitchenTicketResponse> getKitchenTickets(UUID restaurantId) {
        return kitchenTicketRepository.findByOrderRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(this::toKitchenTicketResponse)
                .toList();
    }

    @Transactional
    public KitchenTicketResponse updateKitchenTicketStatus(UUID restaurantId, UUID ticketId, KitchenTicketStatus nextStatus) {
        KitchenTicket ticket = kitchenTicketRepository.findByIdAndOrderRestaurantId(ticketId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kitchen ticket not found"));
        validateKitchenStatusTransition(ticket.getStatus(), nextStatus);
        ticket.setStatus(nextStatus);
        kitchenTicketRepository.save(ticket);

        OrderStatus mappedOrderStatus = mapKitchenToOrderStatus(nextStatus);
        if (mappedOrderStatus != null && ticket.getOrder().getStatus() != mappedOrderStatus) {
            validateStatusTransition(ticket.getOrder().getStatus(), mappedOrderStatus);
            changeOrderStatusInternal(ticket.getOrder(), mappedOrderStatus);
        }

        return toKitchenTicketResponse(ticket);
    }

    @Transactional
    public int autoCancelUnpaidOrdersOlderThan90Minutes() {
        Instant cutoff = Instant.now().minus(90, ChronoUnit.MINUTES);
        List<CustomerOrder> staleOrders = customerOrderRepository.findByStatusAndPaymentStatusAndCreatedAtBefore(
                OrderStatus.PENDING,
                OrderPaymentStatus.UNPAID,
                cutoff
        );

        int count = 0;
        for (CustomerOrder order : staleOrders) {
            if (order.getStatus() == OrderStatus.PENDING && order.getPaymentStatus() == OrderPaymentStatus.UNPAID) {
                changeOrderStatusInternal(order, OrderStatus.CANCELLED);
                count++;
            }
        }
        return count;
    }

    private CustomerOrder getOrderForRestaurant(UUID restaurantId, UUID orderId) {
        return customerOrderRepository.findByIdAndRestaurantId(orderId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private Restaurant getActiveRestaurantBySlug(String slug) {
        Restaurant restaurant = restaurantRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        if (!restaurant.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found");
        }
        return restaurant;
    }

    private void requireOrderingAllowed(Restaurant restaurant) {
        Boolean allowed = restaurant.getSubscription() != null ? restaurant.getSubscription().getAllowOnlineOrders() : null;
        if (!Boolean.TRUE.equals(allowed)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Online ordering not enabled for this subscription");
        }
    }

    private OrderSource resolveOrderSourceForPublic(Restaurant restaurant, UUID tableId, UUID roomId) {
        if (tableId != null && roomId != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide either tableId or roomId, not both");
        }

        if (tableId != null) {
            RestaurantTable table = restaurantTableRepository.findByIdAndRestaurantId(tableId, restaurant.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid table"));
            if (!table.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Table is inactive");
            }
            return new OrderSource(table, null, OrderType.DINE_IN);
        }

        if (roomId != null) {
            Room room = roomRepository.findByIdAndRestaurantId(roomId, restaurant.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid room"));
            if (!room.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room is inactive");
            }
            return new OrderSource(null, room, OrderType.ROOM_SERVICE);
        }

        return new OrderSource(null, null, OrderType.TAKEAWAY);
    }

    private void validateOrderOwnership(CustomerOrder order, UUID tableId, UUID roomId) {
        UUID orderTableId = order.getTable() != null ? order.getTable().getId() : null;
        UUID orderRoomId = order.getRoom() != null ? order.getRoom().getId() : null;

        if (!Objects.equals(orderTableId, tableId) || !Objects.equals(orderRoomId, roomId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order ownership validation failed");
        }
    }

    private String resolveTransactionId(PaymentGateway gateway, String requestedTransactionId, boolean success) {
        if (!success) {
            return requestedTransactionId;
        }
        if (requestedTransactionId != null && !requestedTransactionId.isBlank()) {
            return requestedTransactionId.trim();
        }
        String prefix = switch (gateway) {
            case RAZORPAY -> "razorpay";
            case UPI -> "upi";
            case CASH -> "cash";
        };
        return prefix + "_" + UUID.randomUUID();
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return;
        }
        if (current == OrderStatus.SERVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change status after SERVED");
        }
        if (next == OrderStatus.CANCELLED) {
            return;
        }

        boolean allowed = switch (current) {
            case PENDING -> next == OrderStatus.ACCEPTED;
            case ACCEPTED -> next == OrderStatus.COOKING;
            case COOKING -> next == OrderStatus.READY;
            case READY -> next == OrderStatus.SERVED;
            default -> false;
        };

        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status transition");
        }
    }

    private void validateKitchenStatusTransition(KitchenTicketStatus current, KitchenTicketStatus next) {
        if (current == next) {
            return;
        }
        if (current == KitchenTicketStatus.SERVED || current == KitchenTicketStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kitchen ticket cannot be updated");
        }
        if (next == KitchenTicketStatus.CANCELLED) {
            return;
        }
        boolean allowed = switch (current) {
            case NEW -> next == KitchenTicketStatus.PROCESSING;
            case PROCESSING -> next == KitchenTicketStatus.COOKING;
            case COOKING -> next == KitchenTicketStatus.READY;
            case READY -> next == KitchenTicketStatus.SERVED;
            default -> false;
        };
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid kitchen ticket status transition");
        }
    }

    private OrderStatus mapKitchenToOrderStatus(KitchenTicketStatus status) {
        return switch (status) {
            case PROCESSING -> OrderStatus.ACCEPTED;
            case COOKING -> OrderStatus.COOKING;
            case READY -> OrderStatus.READY;
            case SERVED -> OrderStatus.SERVED;
            case CANCELLED -> OrderStatus.CANCELLED;
            case NEW -> null;
        };
    }

    private void changeOrderStatusInternal(CustomerOrder order, OrderStatus nextStatus) {
        OrderStatus previous = order.getStatus();
        order.setStatus(nextStatus);
        customerOrderRepository.save(order);
        appendStatusHistory(order, nextStatus);
        syncKitchenTicketFromOrder(order, previous, nextStatus);
    }

    private void appendStatusHistory(CustomerOrder order, OrderStatus status) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);
        orderStatusHistoryRepository.save(history);
    }

    private void createKitchenTicket(CustomerOrder order) {
        KitchenTicket ticket = new KitchenTicket();
        ticket.setOrder(order);
        ticket.setStatus(KitchenTicketStatus.NEW);
        kitchenTicketRepository.save(ticket);
    }

    private void syncKitchenTicketFromOrder(CustomerOrder order, OrderStatus previous, OrderStatus next) {
        KitchenTicket ticket = kitchenTicketRepository.findByOrderId(order.getId()).orElse(null);
        if (ticket == null) {
            return;
        }

        KitchenTicketStatus mapped = switch (next) {
            case PENDING -> KitchenTicketStatus.NEW;
            case ACCEPTED -> KitchenTicketStatus.PROCESSING;
            case COOKING -> KitchenTicketStatus.COOKING;
            case READY -> KitchenTicketStatus.READY;
            case SERVED -> KitchenTicketStatus.SERVED;
            case CANCELLED -> KitchenTicketStatus.CANCELLED;
            case CREATED -> null;
        };

        if (mapped != null && ticket.getStatus() != mapped) {
            ticket.setStatus(mapped);
            kitchenTicketRepository.save(ticket);
        }
    }

    private List<AdminOrderResponse> enrichOrders(List<CustomerOrder> orders) {
        if (orders.isEmpty()) {
            return List.of();
        }

        List<UUID> orderIds = orders.stream().map(CustomerOrder::getId).toList();

        Map<UUID, List<OrderItem>> itemsByOrder = orderItemRepository.findByOrderIdIn(orderIds).stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getId()));
        Map<UUID, List<OrderStatusHistory>> historyByOrder = orderStatusHistoryRepository
                .findByOrderIdInOrderByUpdatedAtAsc(orderIds).stream()
                .collect(Collectors.groupingBy(history -> history.getOrder().getId()));
        Map<UUID, List<OrderPayment>> paymentsByOrder = orderPaymentRepository
                .findByOrderIdInOrderByCreatedAtAsc(orderIds).stream()
                .collect(Collectors.groupingBy(payment -> payment.getOrder().getId()));

        Map<UUID, KitchenTicket> ticketsByOrder = kitchenTicketRepository.findByOrderIdIn(orderIds).stream()
                .collect(Collectors.toMap(ticket -> ticket.getOrder().getId(), Function.identity()));

        return orders.stream()
                .map(order -> toAdminOrderResponse(
                        order,
                        itemsByOrder.getOrDefault(order.getId(), List.of()),
                        historyByOrder.getOrDefault(order.getId(), List.of()),
                        paymentsByOrder.getOrDefault(order.getId(), List.of()),
                        ticketsByOrder.get(order.getId())
                ))
                .toList();
    }

    private AdminOrderResponse toAdminOrderResponse(
            CustomerOrder order,
            List<OrderItem> items,
            List<OrderStatusHistory> history,
            List<OrderPayment> payments,
            KitchenTicket ticket
    ) {
        return new AdminOrderResponse(
                order.getId(),
                order.getRestaurant().getId(),
                order.getTable() != null ? order.getTable().getId() : null,
                order.getTable() != null ? order.getTable().getTableNumber() : null,
                order.getRoom() != null ? order.getRoom().getId() : null,
                order.getRoom() != null ? order.getRoom().getRoomNumber() : null,
                order.getOrderType(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                items.stream().map(this::toAdminOrderItem).toList(),
                history.stream().map(this::toAdminHistory).toList(),
                payments.stream().map(this::toAdminPayment).toList(),
                ticket != null ? toKitchenTicketResponse(ticket) : null
        );
    }

    private AdminOrderItemResponse toAdminOrderItem(OrderItem item) {
        return new AdminOrderItemResponse(
                item.getId(),
                item.getMenuItem().getId(),
                item.getMenuItem().getName(),
                item.getVariant() != null ? item.getVariant().getId() : null,
                item.getVariant() != null ? item.getVariant().getName() : null,
                item.getQuantity(),
                item.getPrice()
        );
    }

    private AdminOrderStatusHistoryResponse toAdminHistory(OrderStatusHistory history) {
        return new AdminOrderStatusHistoryResponse(
                history.getId(),
                history.getStatus(),
                history.getUpdatedAt()
        );
    }

    private AdminOrderPaymentResponse toAdminPayment(OrderPayment payment) {
        return new AdminOrderPaymentResponse(
                payment.getId(),
                payment.getGateway(),
                payment.getTransactionId(),
                payment.getStatus(),
                payment.getCreatedAt()
        );
    }

    private KitchenTicketResponse toKitchenTicketResponse(KitchenTicket ticket) {
        return new KitchenTicketResponse(
                ticket.getId(),
                ticket.getOrder().getId(),
                ticket.getStatus(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }

    private record OrderSource(RestaurantTable table, Room room, OrderType orderType) {
    }
}

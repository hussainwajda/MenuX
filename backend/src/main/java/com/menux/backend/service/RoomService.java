package com.menux.backend.service;

import com.menux.backend.dto.RoomCreateRequest;
import com.menux.backend.dto.RoomResponse;
import com.menux.backend.dto.RoomUpdateRequest;
import com.menux.backend.entity.Restaurant;
import com.menux.backend.entity.Room;
import com.menux.backend.repository.RestaurantRepository;
import com.menux.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RestaurantRepository restaurantRepository;
    private final QrCodeService qrCodeService;
    private final SupabaseStorageService storageService;

    @Transactional
    public RoomResponse create(UUID restaurantId, RoomCreateRequest request) {
        Restaurant restaurant = getRestaurant(restaurantId);
        requireUltra(restaurant);
        String roomNumber = normalizeNumber(request.roomNumber());
        if (roomRepository.existsByRestaurantIdAndRoomNumberIgnoreCase(restaurantId, roomNumber)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room number already exists");
        }

        Room room = new Room();
        room.setRestaurant(restaurant);
        room.setRoomNumber(roomNumber);
        room.setActive(request.isActive() != null ? request.isActive() : true);
        Room saved = roomRepository.save(room);

        byte[] qrPng = qrCodeService.generateRoomQr(restaurant, saved.getId());
        String qrUrl = storageService.uploadQrImage(restaurantId, "rooms", saved.getId(), qrPng);
        saved.setQrCodeUrl(qrUrl);

        return toResponse(roomRepository.save(saved));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getAll(UUID restaurantId) {
        Restaurant restaurant = getRestaurant(restaurantId);
        requireUltra(restaurant);
        return roomRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RoomResponse update(UUID restaurantId, UUID roomId, RoomUpdateRequest request) {
        Restaurant restaurant = getRestaurant(restaurantId);
        requireUltra(restaurant);
        Room room = getRoom(restaurantId, roomId);
        if (request.roomNumber() != null && !request.roomNumber().isBlank()) {
            String roomNumber = normalizeNumber(request.roomNumber());
            if (roomRepository.existsByRestaurantIdAndRoomNumberIgnoreCaseAndIdNot(restaurantId, roomNumber, roomId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Room number already exists");
            }
            room.setRoomNumber(roomNumber);
        }
        if (request.isActive() != null) {
            room.setActive(request.isActive());
        }
        return toResponse(roomRepository.save(room));
    }

    @Transactional
    public void delete(UUID restaurantId, UUID roomId) {
        Restaurant restaurant = getRestaurant(restaurantId);
        requireUltra(restaurant);
        Room room = getRoom(restaurantId, roomId);
        room.setActive(false);
        roomRepository.save(room);
    }

    @Transactional
    public RoomResponse toggle(UUID restaurantId, UUID roomId) {
        Restaurant restaurant = getRestaurant(restaurantId);
        requireUltra(restaurant);
        Room room = getRoom(restaurantId, roomId);
        room.setActive(!room.isActive());
        return toResponse(roomRepository.save(room));
    }

    private Restaurant getRestaurant(UUID restaurantId) {
        return restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
    }

    private Room getRoom(UUID restaurantId, UUID roomId) {
        return roomRepository.findByIdAndRestaurantId(roomId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
    }

    private String normalizeNumber(String value) {
        return value != null ? value.trim() : null;
    }

    private void requireUltra(Restaurant restaurant) {
        String planName = restaurant.getSubscription() != null ? restaurant.getSubscription().getName() : null;
        if (planName == null || !planName.equalsIgnoreCase("ULTRA")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "ULTRA subscription required");
        }
    }

    private RoomResponse toResponse(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getQrCodeUrl(),
                room.isActive(),
                room.getCreatedAt()
        );
    }
}

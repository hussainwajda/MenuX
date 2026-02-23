package com.menux.backend.service;

import com.menux.backend.dto.TableCreateRequest;
import com.menux.backend.dto.PublicDiningContextResponse;
import com.menux.backend.dto.TableResponse;
import com.menux.backend.dto.TableUpdateRequest;
import com.menux.backend.entity.Restaurant;
import com.menux.backend.entity.RestaurantTable;
import com.menux.backend.repository.RestaurantRepository;
import com.menux.backend.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableService {

    private final RestaurantTableRepository tableRepository;
    private final RestaurantRepository restaurantRepository;
    private final QrCodeService qrCodeService;
    private final SupabaseStorageService storageService;

    @Transactional
    public TableResponse create(UUID restaurantId, TableCreateRequest request) {
        Restaurant restaurant = getRestaurant(restaurantId);
        String tableNumber = normalizeNumber(request.tableNumber());
        if (tableRepository.existsByRestaurantIdAndTableNumberIgnoreCase(restaurantId, tableNumber)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Table number already exists");
        }

        RestaurantTable table = new RestaurantTable();
        table.setRestaurant(restaurant);
        table.setTableNumber(tableNumber);
        table.setActive(request.isActive() != null ? request.isActive() : true);
        RestaurantTable saved = tableRepository.save(table);

        byte[] qrPng = qrCodeService.generateTableQr(restaurant, saved.getId());
        String qrUrl = storageService.uploadQrImage(restaurantId, "tables", saved.getId(), qrPng);
        saved.setQrCodeUrl(qrUrl);

        return toResponse(tableRepository.save(saved));
    }

    @Transactional(readOnly = true)
    public List<TableResponse> getAll(UUID restaurantId) {
        return tableRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TableResponse getById(UUID restaurantId, UUID tableId) {
        return toResponse(getTable(restaurantId, tableId));
    }

    @Transactional(readOnly = true)
    public PublicDiningContextResponse getPublicContextBySlug(String slug, UUID tableId) {
        Restaurant restaurant = restaurantRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        if (!restaurant.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found");
        }
        RestaurantTable table = getTable(restaurant.getId(), tableId);
        return new PublicDiningContextResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getSlug(),
                restaurant.getLogoUrl(),
                restaurant.getSubscription() != null ? restaurant.getSubscription().getName() : null,
                "table",
                table.getId(),
                table.getTableNumber(),
                table.isActive()
        );
    }

    @Transactional
    public TableResponse update(UUID restaurantId, UUID tableId, TableUpdateRequest request) {
        RestaurantTable table = getTable(restaurantId, tableId);
        if (request.tableNumber() != null && !request.tableNumber().isBlank()) {
            String tableNumber = normalizeNumber(request.tableNumber());
            if (tableRepository.existsByRestaurantIdAndTableNumberIgnoreCaseAndIdNot(restaurantId, tableNumber, tableId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Table number already exists");
            }
            table.setTableNumber(tableNumber);
        }
        if (request.isActive() != null) {
            table.setActive(request.isActive());
        }
        return toResponse(tableRepository.save(table));
    }

    @Transactional
    public void delete(UUID restaurantId, UUID tableId) {
        RestaurantTable table = getTable(restaurantId, tableId);
        tableRepository.delete(table);
    }

    @Transactional
    public TableResponse toggle(UUID restaurantId, UUID tableId) {
        RestaurantTable table = getTable(restaurantId, tableId);
        table.setActive(!table.isActive());
        return toResponse(tableRepository.save(table));
    }

    @Transactional
    public byte[] downloadQr(UUID restaurantId, UUID tableId) {
        RestaurantTable table = getTable(restaurantId, tableId);
        if (table.getQrCodeUrl() == null || table.getQrCodeUrl().isBlank()) {
            Restaurant restaurant = table.getRestaurant();
            byte[] qrPng = qrCodeService.generateTableQr(restaurant, table.getId());
            String qrUrl = storageService.uploadQrImage(restaurantId, "tables", table.getId(), qrPng);
            table.setQrCodeUrl(qrUrl);
            tableRepository.save(table);
        }
        return downloadBytes(table.getQrCodeUrl());
    }

    private Restaurant getRestaurant(UUID restaurantId) {
        return restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
    }

    private RestaurantTable getTable(UUID restaurantId, UUID tableId) {
        return tableRepository.findByIdAndRestaurantId(tableId, restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found"));
    }

    private String normalizeNumber(String value) {
        return value != null ? value.trim() : null;
    }

    private TableResponse toResponse(RestaurantTable table) {
        return new TableResponse(
                table.getId(),
                table.getTableNumber(),
                table.getQrCodeUrl(),
                table.isActive(),
                table.getCreatedAt()
        );
    }

    private byte[] downloadBytes(String url) {
        try (InputStream inputStream = new URL(url).openStream()) {
            return inputStream.readAllBytes();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to download QR code");
        }
    }
}

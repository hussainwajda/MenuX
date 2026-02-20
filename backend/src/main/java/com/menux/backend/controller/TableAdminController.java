package com.menux.backend.controller;

import com.menux.backend.dto.TableCreateRequest;
import com.menux.backend.dto.TableResponse;
import com.menux.backend.dto.TableUpdateRequest;
import com.menux.backend.entity.RestaurantUser;
import com.menux.backend.service.RestaurantAdminAccessService;
import com.menux.backend.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/tables")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class TableAdminController {

    private final TableService tableService;
    private final RestaurantAdminAccessService restaurantAdminAccessService;

    @PostMapping
    public TableResponse create(
            @Valid @RequestBody TableCreateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return tableService.create(user.getRestaurant().getId(), request);
    }

    @GetMapping
    public List<TableResponse> getAll(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return tableService.getAll(user.getRestaurant().getId());
    }

    @PutMapping("/{id}")
    public TableResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody TableUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return tableService.update(user.getRestaurant().getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        tableService.delete(user.getRestaurant().getId(), id);
    }

    @PatchMapping("/{id}/toggle")
    public TableResponse toggle(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        return tableService.toggle(user.getRestaurant().getId(), id);
    }

    @GetMapping("/{id}/qr/download")
    public ResponseEntity<byte[]> downloadQr(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        RestaurantUser user = restaurantAdminAccessService.requireRestaurantAdmin(authorization);
        byte[] png = tableService.downloadQr(user.getRestaurant().getId(), id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=table-" + id + ".png")
                .body(png);
    }
}

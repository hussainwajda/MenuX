package com.menux.backend.controller;

import com.menux.backend.dto.RestaurantRequest;
import com.menux.backend.dto.RestaurantResponse;
import com.menux.backend.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RestaurantController {

    private final RestaurantService service;

    @PostMapping
    public RestaurantResponse create(@Valid @RequestBody RestaurantRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<RestaurantResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public RestaurantResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public RestaurantResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody RestaurantRequest request
    ) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void deactivate(@PathVariable UUID id) {
        service.deactivate(id);
    }
}

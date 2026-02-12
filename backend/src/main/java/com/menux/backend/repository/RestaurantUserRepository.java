package com.menux.backend.repository;

import com.menux.backend.entity.RestaurantUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RestaurantUserRepository extends JpaRepository<RestaurantUser, UUID> {
    @Query("select ru from RestaurantUser ru where ru.authUserId = :authUserId and ru.isActive = true")
    Optional<RestaurantUser> findActiveByAuthUserId(@Param("authUserId") UUID authUserId);

    @Query("select ru from RestaurantUser ru where ru.authUserId = :authUserId and ru.restaurant.id = :restaurantId and ru.isActive = true")
    Optional<RestaurantUser> findActiveByAuthUserIdAndRestaurantId(
            @Param("authUserId") UUID authUserId,
            @Param("restaurantId") UUID restaurantId
    );

    @Query("select ru from RestaurantUser ru where ru.restaurant.id = :restaurantId and ru.role = :role and ru.isActive = true")
    Optional<RestaurantUser> findActiveByRestaurantIdAndRole(
            @Param("restaurantId") UUID restaurantId,
            @Param("role") com.menux.backend.entity.RestaurantRole role
    );

    @Modifying
    @Query("update RestaurantUser ru set ru.isActive = false where ru.restaurant.id = :restaurantId")
    int deactivateByRestaurantId(@Param("restaurantId") UUID restaurantId);
}

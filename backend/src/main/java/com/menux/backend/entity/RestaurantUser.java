package com.menux.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "restaurant_users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_restaurant_user_auth", columnNames = {"restaurant_id", "auth_user_id"}),
                @UniqueConstraint(name = "uq_restaurant_user_auth_only", columnNames = {"auth_user_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "auth_user_id", nullable = false)
    private UUID authUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RestaurantRole role;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "phone")
    private String phone;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}

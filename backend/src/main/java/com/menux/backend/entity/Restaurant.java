package com.menux.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String logoUrl;

    @Column(unique = true, nullable = false)
    private String slug;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String themeConfig;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan subscriptionPlan;

    @Column(nullable = false)
    private boolean isActive = true;


    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;


}

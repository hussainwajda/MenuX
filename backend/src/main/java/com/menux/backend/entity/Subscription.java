package com.menux.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "price_monthly")
    private BigDecimal priceMonthly;

    @Column(name = "price_yearly")
    private BigDecimal priceYearly;

    @Column(name = "max_tables")
    private Integer maxTables;

    @Column(name = "max_menu_items")
    private Integer maxMenuItems;

    @Column(name = "max_admins")
    private Integer maxAdmins;

    @Column(name = "allow_custom_domain")
    private Boolean allowCustomDomain;

    @Column(name = "allow_qr_download")
    private Boolean allowQrDownload;

    @Column(name = "allow_theme_customization")
    private Boolean allowThemeCustomization;

    @Column(name = "allow_analytics")
    private Boolean allowAnalytics;

    @Column(name = "allow_online_orders")
    private Boolean allowOnlineOrders;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String features;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

package com.restaurant.management.orders.entity;

import com.restaurant.management.common.enums.OrderOrigin;
import com.restaurant.management.common.enums.OrderStatus;
import com.restaurant.management.tables.entity.RestaurantTable;
import com.restaurant.management.users.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Table concernée par la commande.
     * Une table ne pourra avoir qu’une seule commande active.
     * Cette règle sera vérifiée dans le service.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "table_id", nullable = false)
    private RestaurantTable table;

    /*
     * Serveur responsable de la commande.
     * Pour une commande QR, il sera récupéré depuis la zone de la table.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id")
    private User server;

    @Enumerated(EnumType.STRING)
    @Column(name = "origin", nullable = false, length = 30)
    private OrderOrigin origin;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private OrderStatus status;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @PrePersist
    public void onCreate() {
        this.orderedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = OrderStatus.EN_ATTENTE;
        }

        if (this.totalAmount == null) {
            this.totalAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        if (OrderStatus.ANNULEE.equals(this.status) && this.cancelledAt == null) {
            this.cancelledAt = LocalDateTime.now();
        }
    }

    public boolean isActive() {
        return status == OrderStatus.EN_ATTENTE
                || status == OrderStatus.EN_PREPARATION
                || status == OrderStatus.SERVIE;
    }

    public boolean isCancelled() {
        return OrderStatus.ANNULEE.equals(status);
    }

    public boolean isFinalStatus() {
        return OrderStatus.FACTUREE.equals(status)
                || OrderStatus.ANNULEE.equals(status);
    }
}
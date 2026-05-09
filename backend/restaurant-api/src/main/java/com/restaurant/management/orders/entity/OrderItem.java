package com.restaurant.management.orders.entity;

import com.restaurant.management.products.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Commande parente.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private CustomerOrder order;

    /*
     * Produit commandé.
     * On garde aussi unitPrice pour conserver l’historique du prix au moment de la commande.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();

        if (this.quantity == null) {
            this.quantity = 1;
        }

        if (this.unitPrice == null) {
            this.unitPrice = BigDecimal.ZERO;
        }

        this.lineTotal = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }

    public void recalculateLineTotal() {
        if (this.unitPrice == null) {
            this.unitPrice = BigDecimal.ZERO;
        }

        if (this.quantity == null) {
            this.quantity = 1;
        }

        this.lineTotal = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }
}
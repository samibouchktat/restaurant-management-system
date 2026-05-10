package com.restaurant.management.invoices.entity;

import com.restaurant.management.common.enums.DiscountType;
import com.restaurant.management.common.enums.InvoiceStatus;
import com.restaurant.management.common.enums.PaymentMode;
import com.restaurant.management.orders.entity.CustomerOrder;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "invoices",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_invoices_invoice_number", columnNames = "invoice_number"),
                @UniqueConstraint(name = "uk_invoices_order_id", columnNames = "order_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Numéro lisible de facture.
     * Exemple : INV-2026-000001
     */
    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    /*
     * Une facture appartient à une seule commande.
     * Une commande ne doit avoir qu’une seule facture.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private CustomerOrder order;

    /*
     * Montant brut = total de la commande avant remise et TVA.
     */
    @Column(name = "subtotal_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 30)
    private DiscountType discountType;

    /*
     * Valeur saisie de remise.
     * Si type PERCENTAGE : 10 signifie 10%.
     * Si type FIXED_AMOUNT : 20 signifie 20 MAD.
     */
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    /*
     * Montant réel calculé de la remise.
     */
    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount;

    /*
     * TVA 20% par défaut.
     * Stockée en base pour garder l’historique même si le taux change plus tard.
     */
    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount;

    /*
     * Total final à payer.
     */
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", length = 30)
    private PaymentMode paymentMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private InvoiceStatus status;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    public void onCreate() {
        this.generatedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = InvoiceStatus.DRAFT;
        }

        if (this.discountType == null) {
            this.discountType = DiscountType.NONE;
        }

        if (this.discountValue == null) {
            this.discountValue = BigDecimal.ZERO;
        }

        if (this.discountAmount == null) {
            this.discountAmount = BigDecimal.ZERO;
        }

        if (this.taxRate == null) {
            this.taxRate = new BigDecimal("20.00");
        }

        if (this.taxAmount == null) {
            this.taxAmount = BigDecimal.ZERO;
        }

        if (this.totalAmount == null) {
            this.totalAmount = BigDecimal.ZERO;
        }

        if (this.subtotalAmount == null) {
            this.subtotalAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        if (InvoiceStatus.PAID.equals(this.status) && this.paidAt == null) {
            this.paidAt = LocalDateTime.now();
        }
    }

    public boolean isPaid() {
        return InvoiceStatus.PAID.equals(this.status);
    }

    public boolean isDraft() {
        return InvoiceStatus.DRAFT.equals(this.status);
    }

    public boolean isCancelled() {
        return InvoiceStatus.CANCELLED.equals(this.status);
    }
}
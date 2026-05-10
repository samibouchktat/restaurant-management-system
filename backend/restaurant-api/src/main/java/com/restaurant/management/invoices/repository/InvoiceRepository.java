package com.restaurant.management.invoices.repository;

import com.restaurant.management.common.enums.InvoiceStatus;
import com.restaurant.management.invoices.entity.Invoice;
import com.restaurant.management.orders.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByOrder(CustomerOrder order);

    boolean existsByOrder(CustomerOrder order);

    boolean existsByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByStatus(InvoiceStatus status);

    List<Invoice> findByGeneratedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<Invoice> findByStatusAndGeneratedAtBetween(
            InvoiceStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}
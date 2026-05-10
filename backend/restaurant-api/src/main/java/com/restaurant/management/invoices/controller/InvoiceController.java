package com.restaurant.management.invoices.controller;

import com.restaurant.management.common.enums.InvoiceStatus;
import com.restaurant.management.common.responses.ApiResponse;
import com.restaurant.management.invoices.dto.ApplyDiscountRequest;
import com.restaurant.management.invoices.dto.InvoiceResponse;
import com.restaurant.management.invoices.dto.ValidatePaymentRequest;
import com.restaurant.management.invoices.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Gestion des factures et paiements")
@SecurityRequirement(name = "bearerAuth")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/from-order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'CAISSIER')")
    @Operation(summary = "Générer une facture depuis une commande servie")
    public ResponseEntity<ApiResponse<InvoiceResponse>> generateInvoiceFromOrder(
            @PathVariable Long orderId
    ) {
        InvoiceResponse response = invoiceService.generateInvoiceFromOrder(orderId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invoice generated successfully", response));
    }

    @PatchMapping("/{id}/discount")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'CAISSIER')")
    @Operation(summary = "Appliquer une remise sur une facture")
    public ResponseEntity<ApiResponse<InvoiceResponse>> applyDiscount(
            @PathVariable Long id,
            @Valid @RequestBody ApplyDiscountRequest request
    ) {
        InvoiceResponse response = invoiceService.applyDiscount(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Discount applied successfully", response)
        );
    }

    @PatchMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'CAISSIER')")
    @Operation(summary = "Valider le paiement d'une facture")
    public ResponseEntity<ApiResponse<InvoiceResponse>> validatePayment(
            @PathVariable Long id,
            @Valid @RequestBody ValidatePaymentRequest request
    ) {
        InvoiceResponse response = invoiceService.validatePayment(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Payment validated successfully", response)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'CAISSIER')")
    @Operation(summary = "Lister les factures avec filtre optionnel par statut")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getInvoices(
            @RequestParam(required = false) InvoiceStatus status
    ) {
        List<InvoiceResponse> response = status == null
                ? invoiceService.getAllInvoices()
                : invoiceService.getInvoicesByStatus(status);

        return ResponseEntity.ok(
                ApiResponse.success("Invoices retrieved successfully", response)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'CAISSIER')")
    @Operation(summary = "Consulter une facture par ID")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(
            @PathVariable Long id
    ) {
        InvoiceResponse response = invoiceService.getInvoiceById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Invoice retrieved successfully", response)
        );
    }

    @GetMapping("/by-order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'CAISSIER')")
    @Operation(summary = "Consulter une facture par commande")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByOrderId(
            @PathVariable Long orderId
    ) {
        InvoiceResponse response = invoiceService.getInvoiceByOrderId(orderId);

        return ResponseEntity.ok(
                ApiResponse.success("Invoice by order retrieved successfully", response)
        );
    }
}
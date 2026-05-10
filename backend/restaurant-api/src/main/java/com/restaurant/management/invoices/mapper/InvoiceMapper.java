package com.restaurant.management.invoices.mapper;

import com.restaurant.management.invoices.dto.InvoiceResponse;
import com.restaurant.management.invoices.entity.Invoice;
import com.restaurant.management.orders.entity.CustomerOrder;
import com.restaurant.management.tables.entity.RestaurantTable;
import com.restaurant.management.users.entity.User;
import org.springframework.stereotype.Component;

@Component
public class InvoiceMapper {

    public InvoiceResponse toResponse(Invoice invoice) {
        CustomerOrder order = invoice.getOrder();
        RestaurantTable table = order != null ? order.getTable() : null;
        User server = order != null ? order.getServer() : null;

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())

                .orderId(order != null ? order.getId() : null)
                .tableId(table != null ? table.getId() : null)
                .tableNumber(table != null ? table.getTableNumber() : null)

                .serverId(server != null ? server.getId() : null)
                .serverInternalId(server != null ? server.getInternalId() : null)
                .serverFullName(server != null
                        ? server.getFirstName() + " " + server.getLastName()
                        : null)

                .orderOrigin(order != null ? order.getOrigin() : null)

                .subtotalAmount(invoice.getSubtotalAmount())

                .discountType(invoice.getDiscountType())
                .discountValue(invoice.getDiscountValue())
                .discountAmount(invoice.getDiscountAmount())

                .taxRate(invoice.getTaxRate())
                .taxAmount(invoice.getTaxAmount())

                .totalAmount(invoice.getTotalAmount())

                .paymentMode(invoice.getPaymentMode())
                .status(invoice.getStatus())

                .generatedAt(invoice.getGeneratedAt())
                .updatedAt(invoice.getUpdatedAt())
                .paidAt(invoice.getPaidAt())
                .build();
    }
}
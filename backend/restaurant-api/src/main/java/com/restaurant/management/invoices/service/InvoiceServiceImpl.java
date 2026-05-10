package com.restaurant.management.invoices.service;

import com.restaurant.management.common.enums.DiscountType;
import com.restaurant.management.common.enums.InvoiceStatus;
import com.restaurant.management.common.enums.OrderStatus;
import com.restaurant.management.common.enums.TableStatus;
import com.restaurant.management.common.exceptions.BadRequestException;
import com.restaurant.management.common.exceptions.ResourceNotFoundException;
import com.restaurant.management.invoices.dto.ApplyDiscountRequest;
import com.restaurant.management.invoices.dto.InvoiceResponse;
import com.restaurant.management.invoices.dto.ValidatePaymentRequest;
import com.restaurant.management.invoices.entity.Invoice;
import com.restaurant.management.invoices.mapper.InvoiceMapper;
import com.restaurant.management.invoices.repository.InvoiceRepository;
import com.restaurant.management.orders.entity.CustomerOrder;
import com.restaurant.management.orders.repository.CustomerOrderRepository;
import com.restaurant.management.tables.entity.RestaurantTable;
import com.restaurant.management.tables.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Year;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private static final BigDecimal DEFAULT_TAX_RATE = new BigDecimal("20.00");
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100.00");

    private final InvoiceRepository invoiceRepository;
    private final CustomerOrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final InvoiceMapper invoiceMapper;

    @Override
    public InvoiceResponse generateInvoiceFromOrder(Long orderId) {
        CustomerOrder order = findOrderById(orderId);

        if (!OrderStatus.SERVIE.equals(order.getStatus())) {
            throw new BadRequestException("Invoice can only be generated from a served order");
        }

        if (invoiceRepository.existsByOrder(order)) {
            throw new BadRequestException("Invoice already exists for this order");
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .order(order)
                .subtotalAmount(order.getTotalAmount())
                .discountType(DiscountType.NONE)
                .discountValue(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .taxRate(DEFAULT_TAX_RATE)
                .status(InvoiceStatus.DRAFT)
                .build();

        recalculateInvoiceAmounts(invoice);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return invoiceMapper.toResponse(savedInvoice);
    }

    @Override
    public InvoiceResponse applyDiscount(Long invoiceId, ApplyDiscountRequest request) {
        Invoice invoice = findInvoiceById(invoiceId);

        validateInvoiceCanBeModified(invoice);
        validateDiscount(request, invoice.getSubtotalAmount());

        invoice.setDiscountType(request.getDiscountType());
        invoice.setDiscountValue(normalizeAmount(request.getDiscountValue()));

        if (DiscountType.NONE.equals(request.getDiscountType())) {
            invoice.setDiscountValue(BigDecimal.ZERO);
        }

        recalculateInvoiceAmounts(invoice);

        Invoice updatedInvoice = invoiceRepository.save(invoice);

        return invoiceMapper.toResponse(updatedInvoice);
    }

    @Override
    public InvoiceResponse validatePayment(Long invoiceId, ValidatePaymentRequest request) {
        Invoice invoice = findInvoiceById(invoiceId);

        if (invoice.isPaid()) {
            throw new BadRequestException("Invoice is already paid");
        }

        if (invoice.isCancelled()) {
            throw new BadRequestException("Cancelled invoice cannot be paid");
        }

        invoice.setPaymentMode(request.getPaymentMode());
        invoice.setStatus(InvoiceStatus.PAID);

        CustomerOrder order = invoice.getOrder();
        order.setStatus(OrderStatus.FACTUREE);
        orderRepository.save(order);

        RestaurantTable table = order.getTable();
        table.setStatus(TableStatus.LIBRE);
        tableRepository.save(table);

        Invoice paidInvoice = invoiceRepository.save(invoice);

        return invoiceMapper.toResponse(paidInvoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Invoice::getGeneratedAt).reversed())
                .map(invoiceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status) {
        return invoiceRepository.findByStatus(status)
                .stream()
                .sorted(Comparator.comparing(Invoice::getGeneratedAt).reversed())
                .map(invoiceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = findInvoiceById(id);
        return invoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByOrderId(Long orderId) {
        CustomerOrder order = findOrderById(orderId);

        Invoice invoice = invoiceRepository.findByOrder(order)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invoice not found for order id: " + orderId
                ));

        return invoiceMapper.toResponse(invoice);
    }

    private void validateInvoiceCanBeModified(Invoice invoice) {
        if (invoice.isPaid()) {
            throw new BadRequestException("Paid invoice cannot be modified");
        }

        if (invoice.isCancelled()) {
            throw new BadRequestException("Cancelled invoice cannot be modified");
        }
    }

    private void validateDiscount(ApplyDiscountRequest request, BigDecimal subtotalAmount) {
        if (request.getDiscountType() == null) {
            throw new BadRequestException("Discount type is required");
        }

        if (request.getDiscountValue() == null) {
            throw new BadRequestException("Discount value is required");
        }

        if (request.getDiscountValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Discount value must be greater than or equal to 0");
        }

        if (DiscountType.NONE.equals(request.getDiscountType())
                && request.getDiscountValue().compareTo(BigDecimal.ZERO) != 0) {
            throw new BadRequestException("Discount value must be 0 when discount type is NONE");
        }

        if (DiscountType.PERCENTAGE.equals(request.getDiscountType())
                && request.getDiscountValue().compareTo(ONE_HUNDRED) > 0) {
            throw new BadRequestException("Percentage discount cannot exceed 100");
        }

        if (DiscountType.FIXED_AMOUNT.equals(request.getDiscountType())
                && request.getDiscountValue().compareTo(subtotalAmount) > 0) {
            throw new BadRequestException("Fixed discount cannot exceed invoice subtotal");
        }
    }

    private void recalculateInvoiceAmounts(Invoice invoice) {
        BigDecimal subtotalAmount = normalizeAmount(invoice.getSubtotalAmount());
        BigDecimal discountAmount = calculateDiscountAmount(
                subtotalAmount,
                invoice.getDiscountType(),
                invoice.getDiscountValue()
        );

        BigDecimal taxableAmount = subtotalAmount.subtract(discountAmount);

        if (taxableAmount.compareTo(BigDecimal.ZERO) < 0) {
            taxableAmount = BigDecimal.ZERO;
        }

        BigDecimal taxRate = invoice.getTaxRate() != null
                ? invoice.getTaxRate()
                : DEFAULT_TAX_RATE;

        BigDecimal taxAmount = taxableAmount
                .multiply(taxRate)
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = taxableAmount.add(taxAmount);

        invoice.setSubtotalAmount(normalizeAmount(subtotalAmount));
        invoice.setDiscountAmount(normalizeAmount(discountAmount));
        invoice.setTaxRate(normalizeAmount(taxRate));
        invoice.setTaxAmount(normalizeAmount(taxAmount));
        invoice.setTotalAmount(normalizeAmount(totalAmount));
    }

    private BigDecimal calculateDiscountAmount(
            BigDecimal subtotalAmount,
            DiscountType discountType,
            BigDecimal discountValue
    ) {
        if (discountType == null || DiscountType.NONE.equals(discountType)) {
            return BigDecimal.ZERO;
        }

        BigDecimal normalizedDiscountValue = normalizeAmount(discountValue);

        if (DiscountType.PERCENTAGE.equals(discountType)) {
            return subtotalAmount
                    .multiply(normalizedDiscountValue)
                    .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
        }

        if (DiscountType.FIXED_AMOUNT.equals(discountType)) {
            return normalizedDiscountValue;
        }

        return BigDecimal.ZERO;
    }

    private String generateInvoiceNumber() {
        int currentYear = Year.now().getValue();

        long nextNumber = invoiceRepository.count() + 1;

        String invoiceNumber;

        do {
            invoiceNumber = String.format("INV-%d-%06d", currentYear, nextNumber);
            nextNumber++;
        } while (invoiceRepository.existsByInvoiceNumber(invoiceNumber));

        return invoiceNumber;
    }

    private BigDecimal normalizeAmount(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private Invoice findInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    private CustomerOrder findOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }
}
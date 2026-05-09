package com.restaurant.management.products.service;

import com.restaurant.management.categories.entity.Category;
import com.restaurant.management.categories.repository.CategoryRepository;
import com.restaurant.management.common.exceptions.BadRequestException;
import com.restaurant.management.common.exceptions.ResourceNotFoundException;
import com.restaurant.management.products.dto.ProductCreateRequest;
import com.restaurant.management.products.dto.ProductResponse;
import com.restaurant.management.products.dto.ProductUpdateRequest;
import com.restaurant.management.products.entity.Product;
import com.restaurant.management.products.mapper.ProductMapper;
import com.restaurant.management.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponse createProduct(ProductCreateRequest request) {
        String productName = request.getName().trim();

        if (productRepository.existsByNameIgnoreCase(productName)) {
            throw new BadRequestException("Product name already exists");
        }

        validatePrice(request.getPrice());

        Category category = findCategoryById(request.getCategoryId());

        if (!category.isActive()) {
            throw new BadRequestException("Cannot create a product in an inactive category");
        }

        Product product = productMapper.toEntity(request, category);
        Product savedProduct = productRepository.save(product);

        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .sorted(
                        Comparator.comparing((Product product) -> product.getCategory().getDisplayOrder())
                                .thenComparing(product -> product.getCategory().getName(), String.CASE_INSENSITIVE_ORDER)
                                .thenComparing(Product::getName, String.CASE_INSENSITIVE_ORDER)
                )
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByActiveTrue()
                .stream()
                .sorted(
                        Comparator.comparing((Product product) -> product.getCategory().getDisplayOrder())
                                .thenComparing(product -> product.getCategory().getName(), String.CASE_INSENSITIVE_ORDER)
                                .thenComparing(Product::getName, String.CASE_INSENSITIVE_ORDER)
                )
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAvailableProducts() {
        return productRepository.findByActiveTrueAndAvailableTrue()
                .stream()
                .filter(product -> product.getCategory().isActive())
                .sorted(
                        Comparator.comparing((Product product) -> product.getCategory().getDisplayOrder())
                                .thenComparing(product -> product.getCategory().getName(), String.CASE_INSENSITIVE_ORDER)
                                .thenComparing(Product::getName, String.CASE_INSENSITIVE_ORDER)
                )
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        Category category = findCategoryById(categoryId);

        return productRepository.findByCategory(category)
                .stream()
                .sorted(Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER))
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAvailableProductsByCategory(Long categoryId) {
        Category category = findCategoryById(categoryId);

        if (!category.isActive()) {
            throw new BadRequestException("Category is inactive");
        }

        return productRepository.findByCategoryAndActiveTrueAndAvailableTrue(category)
                .stream()
                .sorted(Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER))
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = findProductById(id);
        return productMapper.toResponse(product);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = findProductById(id);

        String newProductName = request.getName().trim();

        productRepository.findByNameIgnoreCase(newProductName)
                .filter(existingProduct -> !existingProduct.getId().equals(id))
                .ifPresent(existingProduct -> {
                    throw new BadRequestException("Product name already exists");
                });

        validatePrice(request.getPrice());

        Category category = findCategoryById(request.getCategoryId());

        if (!category.isActive()) {
            throw new BadRequestException("Cannot move a product to an inactive category");
        }

        productMapper.updateEntity(product, request, category);

        Product updatedProduct = productRepository.save(product);

        return productMapper.toResponse(updatedProduct);
    }

    @Override
    public ProductResponse activateProduct(Long id) {
        Product product = findProductById(id);

        if (product.isActive()) {
            throw new BadRequestException("Product is already active");
        }

        if (!product.getCategory().isActive()) {
            throw new BadRequestException("Cannot activate product because its category is inactive");
        }

        product.setActive(true);

        Product updatedProduct = productRepository.save(product);

        return productMapper.toResponse(updatedProduct);
    }

    @Override
    public ProductResponse deactivateProduct(Long id) {
        Product product = findProductById(id);

        if (!product.isActive()) {
            throw new BadRequestException("Product is already inactive");
        }

        product.setActive(false);
        product.setAvailable(false);

        Product updatedProduct = productRepository.save(product);

        return productMapper.toResponse(updatedProduct);
    }

    @Override
    public ProductResponse markProductAsAvailable(Long id) {
        Product product = findProductById(id);

        if (!product.isActive()) {
            throw new BadRequestException("Cannot make an inactive product available");
        }

        if (!product.getCategory().isActive()) {
            throw new BadRequestException("Cannot make product available because its category is inactive");
        }

        if (product.isAvailable()) {
            throw new BadRequestException("Product is already available");
        }

        product.setAvailable(true);

        Product updatedProduct = productRepository.save(product);

        return productMapper.toResponse(updatedProduct);
    }

    @Override
    public ProductResponse markProductAsUnavailable(Long id) {
        Product product = findProductById(id);

        if (!product.isAvailable()) {
            throw new BadRequestException("Product is already unavailable");
        }

        product.setAvailable(false);

        Product updatedProduct = productRepository.save(product);

        return productMapper.toResponse(updatedProduct);
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private void validatePrice(BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Product price must be greater than 0");
        }
    }
}
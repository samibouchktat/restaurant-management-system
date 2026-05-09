package com.restaurant.management.categories.service;

import com.restaurant.management.categories.dto.CategoryCreateRequest;
import com.restaurant.management.categories.dto.CategoryResponse;
import com.restaurant.management.categories.dto.CategoryUpdateRequest;
import com.restaurant.management.categories.entity.Category;
import com.restaurant.management.categories.mapper.CategoryMapper;
import com.restaurant.management.categories.repository.CategoryRepository;
import com.restaurant.management.common.exceptions.BadRequestException;
import com.restaurant.management.common.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        String categoryName = request.getName().trim();

        if (categoryRepository.existsByNameIgnoreCase(categoryName)) {
            throw new BadRequestException("Category name already exists");
        }

        Category category = categoryMapper.toEntity(request);
        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .sorted(
                        Comparator.comparing(Category::getDisplayOrder)
                                .thenComparing(Category::getName, String.CASE_INSENSITIVE_ORDER)
                )
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = findCategoryById(id);
        return categoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = findCategoryById(id);

        String newName = request.getName().trim();

        categoryRepository.findByNameIgnoreCase(newName)
                .filter(existingCategory -> !existingCategory.getId().equals(id))
                .ifPresent(existingCategory -> {
                    throw new BadRequestException("Category name already exists");
                });

        categoryMapper.updateEntity(category, request);

        Category updatedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(updatedCategory);
    }

    @Override
    public CategoryResponse activateCategory(Long id) {
        Category category = findCategoryById(id);

        if (category.isActive()) {
            throw new BadRequestException("Category is already active");
        }

        category.setActive(true);

        Category updatedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(updatedCategory);
    }

    @Override
    public CategoryResponse deactivateCategory(Long id) {
        Category category = findCategoryById(id);

        if (!category.isActive()) {
            throw new BadRequestException("Category is already inactive");
        }

        category.setActive(false);

        Category updatedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(updatedCategory);
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
}
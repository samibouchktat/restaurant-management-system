package com.restaurant.management.products.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PublicMenuCategoryResponse {

    private Long id;
    private String name;
    private String description;
    private Integer displayOrder;
    private List<ProductResponse> products;
}
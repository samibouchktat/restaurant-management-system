package com.restaurant.management.tables.dto;

import com.restaurant.management.common.enums.TableStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TableStatusUpdateRequest {

    @NotNull(message = "Table status is required")
    private TableStatus status;
}
package com.restaurant.management.tables.dto;

import com.restaurant.management.common.enums.TableStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TableResponse {

    private Long id;
    private String tableNumber;
    private Integer capacity;
    private TableStatus status;
    private boolean active;
    private String qrCodeUrl;

    private Long zoneId;
    private String zoneName;

    private Long assignedServerId;
    private String assignedServerInternalId;
    private String assignedServerFullName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
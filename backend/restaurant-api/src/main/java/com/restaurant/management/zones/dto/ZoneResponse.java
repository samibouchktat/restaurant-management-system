package com.restaurant.management.zones.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ZoneResponse {

    private Long id;
    private String name;
    private String description;
    private boolean active;

    private Long assignedServerId;
    private String assignedServerInternalId;
    private String assignedServerFullName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
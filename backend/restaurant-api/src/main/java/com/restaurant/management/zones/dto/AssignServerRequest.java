package com.restaurant.management.zones.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignServerRequest {

    @NotNull(message = "Server ID is required")
    private Long serverId;
}
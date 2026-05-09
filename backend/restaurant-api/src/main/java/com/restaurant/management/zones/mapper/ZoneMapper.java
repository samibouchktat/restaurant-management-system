package com.restaurant.management.zones.mapper;

import com.restaurant.management.users.entity.User;
import com.restaurant.management.zones.dto.ZoneCreateRequest;
import com.restaurant.management.zones.dto.ZoneResponse;
import com.restaurant.management.zones.dto.ZoneUpdateRequest;
import com.restaurant.management.zones.entity.Zone;
import org.springframework.stereotype.Component;

@Component
public class ZoneMapper {

    public Zone toEntity(ZoneCreateRequest request) {
        return Zone.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .active(true)
                .build();
    }

    public void updateEntity(Zone zone, ZoneUpdateRequest request) {
        zone.setName(request.getName().trim());
        zone.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
    }

    public ZoneResponse toResponse(Zone zone) {
        User assignedServer = zone.getAssignedServer();

        return ZoneResponse.builder()
                .id(zone.getId())
                .name(zone.getName())
                .description(zone.getDescription())
                .active(zone.isActive())
                .assignedServerId(assignedServer != null ? assignedServer.getId() : null)
                .assignedServerInternalId(assignedServer != null ? assignedServer.getInternalId() : null)
                .assignedServerFullName(assignedServer != null
                        ? assignedServer.getFirstName() + " " + assignedServer.getLastName()
                        : null)
                .createdAt(zone.getCreatedAt())
                .updatedAt(zone.getUpdatedAt())
                .build();
    }
}
package com.restaurant.management.tables.mapper;

import com.restaurant.management.common.enums.TableStatus;
import com.restaurant.management.tables.dto.TableCreateRequest;
import com.restaurant.management.tables.dto.TableResponse;
import com.restaurant.management.tables.dto.TableUpdateRequest;
import com.restaurant.management.tables.entity.RestaurantTable;
import com.restaurant.management.users.entity.User;
import com.restaurant.management.zones.entity.Zone;
import org.springframework.stereotype.Component;

@Component
public class RestaurantTableMapper {

    public RestaurantTable toEntity(TableCreateRequest request, Zone zone, String qrCodeUrl) {
        return RestaurantTable.builder()
                .tableNumber(request.getTableNumber().trim())
                .capacity(request.getCapacity())
                .status(TableStatus.LIBRE)
                .zone(zone)
                .active(true)
                .qrCodeUrl(qrCodeUrl)
                .build();
    }

    public void updateEntity(RestaurantTable table, TableUpdateRequest request, Zone zone, String qrCodeUrl) {
        table.setTableNumber(request.getTableNumber().trim());
        table.setCapacity(request.getCapacity());
        table.setZone(zone);
        table.setQrCodeUrl(qrCodeUrl);
    }

    public TableResponse toResponse(RestaurantTable table) {
        Zone zone = table.getZone();
        User assignedServer = zone != null ? zone.getAssignedServer() : null;

        return TableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .status(table.getStatus())
                .active(table.isActive())
                .qrCodeUrl(table.getQrCodeUrl())
                .zoneId(zone != null ? zone.getId() : null)
                .zoneName(zone != null ? zone.getName() : null)
                .assignedServerId(assignedServer != null ? assignedServer.getId() : null)
                .assignedServerInternalId(assignedServer != null ? assignedServer.getInternalId() : null)
                .assignedServerFullName(assignedServer != null
                        ? assignedServer.getFirstName() + " " + assignedServer.getLastName()
                        : null)
                .createdAt(table.getCreatedAt())
                .updatedAt(table.getUpdatedAt())
                .build();
    }
}
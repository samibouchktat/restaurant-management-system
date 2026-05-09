package com.restaurant.management.tables.service;

import com.restaurant.management.tables.dto.TableCreateRequest;
import com.restaurant.management.tables.dto.TableResponse;
import com.restaurant.management.tables.dto.TableStatusUpdateRequest;
import com.restaurant.management.tables.dto.TableUpdateRequest;

import java.util.List;

public interface RestaurantTableService {

    TableResponse createTable(TableCreateRequest request);

    List<TableResponse> getAllTables();

    List<TableResponse> getActiveTables();

    TableResponse getTableById(Long id);

    TableResponse updateTable(Long id, TableUpdateRequest request);

    TableResponse updateTableStatus(Long id, TableStatusUpdateRequest request);

    TableResponse activateTable(Long id);

    TableResponse deactivateTable(Long id);

    List<TableResponse> getTablesByZone(Long zoneId);

    List<TableResponse> getTablesByServer(Long serverId);

    List<TableResponse> getFloorPlan();
}
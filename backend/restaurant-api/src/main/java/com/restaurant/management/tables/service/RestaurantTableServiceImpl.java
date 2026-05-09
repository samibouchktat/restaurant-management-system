package com.restaurant.management.tables.service;

import com.restaurant.management.common.enums.UserRole;
import com.restaurant.management.common.exceptions.BadRequestException;
import com.restaurant.management.common.exceptions.ResourceNotFoundException;
import com.restaurant.management.tables.dto.TableCreateRequest;
import com.restaurant.management.tables.dto.TableResponse;
import com.restaurant.management.tables.dto.TableStatusUpdateRequest;
import com.restaurant.management.tables.dto.TableUpdateRequest;
import com.restaurant.management.tables.entity.RestaurantTable;
import com.restaurant.management.tables.mapper.RestaurantTableMapper;
import com.restaurant.management.tables.repository.RestaurantTableRepository;
import com.restaurant.management.users.entity.User;
import com.restaurant.management.users.repository.UserRepository;
import com.restaurant.management.zones.entity.Zone;
import com.restaurant.management.zones.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RestaurantTableServiceImpl implements RestaurantTableService {

    private final RestaurantTableRepository tableRepository;
    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;
    private final RestaurantTableMapper tableMapper;

    @Override
    public TableResponse createTable(TableCreateRequest request) {
        String tableNumber = request.getTableNumber().trim();

        if (tableRepository.existsByTableNumberIgnoreCase(tableNumber)) {
            throw new BadRequestException("Table number already exists");
        }

        Zone zone = findZoneById(request.getZoneId());

        if (!zone.isActive()) {
            throw new BadRequestException("Cannot create a table in an inactive zone");
        }

        RestaurantTable table = tableMapper.toEntity(request, zone, null);

        RestaurantTable savedTable = tableRepository.save(table);

        savedTable.setQrCodeUrl(generateQrCodeUrl(savedTable.getId()));

        RestaurantTable updatedTable = tableRepository.save(savedTable);

        return tableMapper.toResponse(updatedTable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        return tableRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(RestaurantTable::getId))
                .map(tableMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getActiveTables() {
        return tableRepository.findAll()
                .stream()
                .filter(RestaurantTable::isActive)
                .sorted(Comparator.comparing(RestaurantTable::getId))
                .map(tableMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        RestaurantTable table = findTableById(id);
        return tableMapper.toResponse(table);
    }

    @Override
    public TableResponse updateTable(Long id, TableUpdateRequest request) {
        RestaurantTable table = findTableById(id);

        String newTableNumber = request.getTableNumber().trim();

        tableRepository.findByTableNumberIgnoreCase(newTableNumber)
                .filter(existingTable -> !existingTable.getId().equals(id))
                .ifPresent(existingTable -> {
                    throw new BadRequestException("Table number already exists");
                });

        Zone zone = findZoneById(request.getZoneId());

        if (!zone.isActive()) {
            throw new BadRequestException("Cannot move a table to an inactive zone");
        }

        String qrCodeUrl = generateQrCodeUrl(table.getId());

        tableMapper.updateEntity(table, request, zone, qrCodeUrl);

        RestaurantTable updatedTable = tableRepository.save(table);

        return tableMapper.toResponse(updatedTable);
    }

    @Override
    public TableResponse updateTableStatus(Long id, TableStatusUpdateRequest request) {
        RestaurantTable table = findTableById(id);

        if (!table.isActive()) {
            throw new BadRequestException("Cannot update status of an inactive table");
        }

        table.setStatus(request.getStatus());

        RestaurantTable updatedTable = tableRepository.save(table);

        return tableMapper.toResponse(updatedTable);
    }

    @Override
    public TableResponse activateTable(Long id) {
        RestaurantTable table = findTableById(id);

        if (table.isActive()) {
            throw new BadRequestException("Table is already active");
        }

        table.setActive(true);

        RestaurantTable updatedTable = tableRepository.save(table);

        return tableMapper.toResponse(updatedTable);
    }

    @Override
    public TableResponse deactivateTable(Long id) {
        RestaurantTable table = findTableById(id);

        if (!table.isActive()) {
            throw new BadRequestException("Table is already inactive");
        }

        table.setActive(false);

        RestaurantTable updatedTable = tableRepository.save(table);

        return tableMapper.toResponse(updatedTable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getTablesByZone(Long zoneId) {
        Zone zone = findZoneById(zoneId);

        return tableRepository.findByZone(zone)
                .stream()
                .sorted(Comparator.comparing(RestaurantTable::getId))
                .map(tableMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getTablesByServer(Long serverId) {
        User server = findUserById(serverId);

        if (!UserRole.SERVEUR.equals(server.getRole())) {
            throw new BadRequestException("User must have SERVEUR role");
        }

        return tableRepository.findByZoneAssignedServer(server)
                .stream()
                .filter(RestaurantTable::isActive)
                .sorted(Comparator.comparing(RestaurantTable::getId))
                .map(tableMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getFloorPlan() {
        return tableRepository.findAll()
                .stream()
                .filter(RestaurantTable::isActive)
                .sorted(
                        Comparator.comparing((RestaurantTable table) -> table.getZone().getName())
                                .thenComparing(RestaurantTable::getTableNumber)
                )
                .map(tableMapper::toResponse)
                .toList();
    }

    private RestaurantTable findTableById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));
    }

    private Zone findZoneById(Long id) {
        return zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private String generateQrCodeUrl(Long tableId) {
        return "/table/" + tableId;
    }
}
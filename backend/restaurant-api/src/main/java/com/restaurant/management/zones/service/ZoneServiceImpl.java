package com.restaurant.management.zones.service;

import com.restaurant.management.common.enums.UserRole;
import com.restaurant.management.common.exceptions.BadRequestException;
import com.restaurant.management.common.exceptions.ResourceNotFoundException;
import com.restaurant.management.users.entity.User;
import com.restaurant.management.users.repository.UserRepository;
import com.restaurant.management.zones.dto.AssignServerRequest;
import com.restaurant.management.zones.dto.ZoneCreateRequest;
import com.restaurant.management.zones.dto.ZoneResponse;
import com.restaurant.management.zones.dto.ZoneUpdateRequest;
import com.restaurant.management.zones.entity.Zone;
import com.restaurant.management.zones.mapper.ZoneMapper;
import com.restaurant.management.zones.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ZoneServiceImpl implements ZoneService {

    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;
    private final ZoneMapper zoneMapper;

    @Override
    public ZoneResponse createZone(ZoneCreateRequest request) {
        String zoneName = request.getName().trim();

        if (zoneRepository.existsByNameIgnoreCase(zoneName)) {
            throw new BadRequestException("Zone name already exists");
        }

        Zone zone = zoneMapper.toEntity(request);
        Zone savedZone = zoneRepository.save(zone);

        return zoneMapper.toResponse(savedZone);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZoneResponse> getAllZones() {
        return zoneRepository.findAll()
                .stream()
                .map(zoneMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZoneResponse> getActiveZones() {
        return zoneRepository.findAll()
                .stream()
                .filter(Zone::isActive)
                .map(zoneMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ZoneResponse getZoneById(Long id) {
        Zone zone = findZoneById(id);
        return zoneMapper.toResponse(zone);
    }

    @Override
    public ZoneResponse updateZone(Long id, ZoneUpdateRequest request) {
        Zone zone = findZoneById(id);

        String newName = request.getName().trim();

        zoneRepository.findByNameIgnoreCase(newName)
                .filter(existingZone -> !existingZone.getId().equals(id))
                .ifPresent(existingZone -> {
                    throw new BadRequestException("Zone name already exists");
                });

        zoneMapper.updateEntity(zone, request);

        Zone updatedZone = zoneRepository.save(zone);

        return zoneMapper.toResponse(updatedZone);
    }

    @Override
    public ZoneResponse activateZone(Long id) {
        Zone zone = findZoneById(id);

        if (zone.isActive()) {
            throw new BadRequestException("Zone is already active");
        }

        zone.setActive(true);

        Zone updatedZone = zoneRepository.save(zone);

        return zoneMapper.toResponse(updatedZone);
    }

    @Override
    public ZoneResponse deactivateZone(Long id) {
        Zone zone = findZoneById(id);

        if (!zone.isActive()) {
            throw new BadRequestException("Zone is already inactive");
        }

        zone.setActive(false);

        Zone updatedZone = zoneRepository.save(zone);

        return zoneMapper.toResponse(updatedZone);
    }

    @Override
    public ZoneResponse assignServerToZone(Long zoneId, AssignServerRequest request) {
        Zone zone = findZoneById(zoneId);

        if (!zone.isActive()) {
            throw new BadRequestException("Cannot assign a server to an inactive zone");
        }

        User server = userRepository.findById(request.getServerId())
                .orElseThrow(() -> new ResourceNotFoundException("Server not found with id: " + request.getServerId()));

        if (!server.isActive()) {
            throw new BadRequestException("Cannot assign an inactive user to a zone");
        }

        if (!UserRole.SERVEUR.equals(server.getRole())) {
            throw new BadRequestException("Assigned user must have SERVEUR role");
        }

        zone.setAssignedServer(server);

        Zone updatedZone = zoneRepository.save(zone);

        return zoneMapper.toResponse(updatedZone);
    }

    @Override
    public ZoneResponse removeAssignedServer(Long zoneId) {
        Zone zone = findZoneById(zoneId);

        if (zone.getAssignedServer() == null) {
            throw new BadRequestException("Zone has no assigned server");
        }

        zone.setAssignedServer(null);

        Zone updatedZone = zoneRepository.save(zone);

        return zoneMapper.toResponse(updatedZone);
    }

    private Zone findZoneById(Long id) {
        return zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));
    }
}
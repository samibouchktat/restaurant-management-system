package com.restaurant.management.zones.service;

import com.restaurant.management.zones.dto.AssignServerRequest;
import com.restaurant.management.zones.dto.ZoneCreateRequest;
import com.restaurant.management.zones.dto.ZoneResponse;
import com.restaurant.management.zones.dto.ZoneUpdateRequest;

import java.util.List;

public interface ZoneService {

    ZoneResponse createZone(ZoneCreateRequest request);

    List<ZoneResponse> getAllZones();

    List<ZoneResponse> getActiveZones();

    ZoneResponse getZoneById(Long id);

    ZoneResponse updateZone(Long id, ZoneUpdateRequest request);

    ZoneResponse activateZone(Long id);

    ZoneResponse deactivateZone(Long id);

    ZoneResponse assignServerToZone(Long zoneId, AssignServerRequest request);

    ZoneResponse removeAssignedServer(Long zoneId);
}
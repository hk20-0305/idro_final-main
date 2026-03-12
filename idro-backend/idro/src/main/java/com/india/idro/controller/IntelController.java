package com.india.idro.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.india.idro.dto.IntelMarkerDTO;
import com.india.idro.model.IntelAlert;
import com.india.idro.repository.IntelAlertRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/intel")
@RequiredArgsConstructor
public class IntelController {

    private final IntelAlertRepository intelRepo;

    /**
     * GET /api/intel
     * Root endpoint – returns all India intel alerts ordered by most recent first.
     * Prevents 500 "No static resource api/intel" when the base path is hit
     * directly.
     */
    @GetMapping
    public List<IntelAlert> getAll() {
        return intelRepo.findByCountryOrderByCreatedAtDesc("India");
    }

    /**
     * GET /api/intel/stream
     * Returns all India intel alerts ordered by most recent first.
     */
    @GetMapping("/stream")
    public List<IntelAlert> getIntelStream() {
        return intelRepo.findByCountryOrderByCreatedAtDesc("India");
    }

    /**
     * GET /api/intel/markers
     * Returns lightweight marker DTOs for map rendering.
     */
    @GetMapping("/markers")
    public List<IntelMarkerDTO> getMarkers() {
        return intelRepo.findByCountry("India")
                .stream()
                .map(alert -> new IntelMarkerDTO(
                        alert.getId(),
                        alert.getLatitude(),
                        alert.getLongitude(),
                        alert.getSeverity()))
                .toList();
    }

    /**
     * GET /api/intel/gdacs
     * Returns GDACS-only alerts for India (source=null records).
     * IntelImportService never sets source, so all GDACS data has source=null.
     */
    @GetMapping("/gdacs")
    public List<IntelAlert> getGdacsStream() {
        return intelRepo.findByCountryAndSourceIsNullOrderByCreatedAtDesc("India");
    }

    /**
     * GET /api/intel/usgs
     * NEW: Returns USGS earthquake alerts (source = "USGS") ordered by newest
     * first.
     * Used by the split Intel Stream panel — USGS section.
     */
    @GetMapping("/usgs")
    public List<IntelAlert> getUsgsStream() {
        return intelRepo.findBySourceOrderByCreatedAtDesc("USGS");
    }
}

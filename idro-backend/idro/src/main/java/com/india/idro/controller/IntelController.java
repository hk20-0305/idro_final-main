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

    @GetMapping
    public List<IntelAlert> getAll() {
        return intelRepo.findByCountryOrderByCreatedAtDesc("India");
    }

    @GetMapping("/stream")
    public List<IntelAlert> getIntelStream() {
        return intelRepo.findByCountryOrderByCreatedAtDesc("India");
    }

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

    @GetMapping("/gdacs")
    public List<IntelAlert> getGdacsStream() {
        return intelRepo.findByCountryAndSourceIsNullOrderByCreatedAtDesc("India");
    }

    @GetMapping("/usgs")
    public List<IntelAlert> getUsgsStream() {
        return intelRepo.findBySourceOrderByCreatedAtDesc("USGS");
    }
}

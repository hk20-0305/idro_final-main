package com.india.idro.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.india.idro.dto.GdacsEvent;
import com.india.idro.dto.GdacsResponse;
import com.india.idro.model.IntelAlert;
import com.india.idro.repository.IntelAlertRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IntelImportService {

    private static final Logger log = LoggerFactory.getLogger(IntelImportService.class);

    private final IntelAlertRepository intelRepo;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GDACS_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?pagesize=50&pagenumber=1";

    /**
     * Fetches disaster events from GDACS every 15 minutes.
     * Only India events are persisted; duplicates are skipped using externalId.
     */
    @Scheduled(cron = "0 */10 * * * *") // fixedRate = 30000
    public void fetchIndiaDisasters() {
        log.info("[IntelImportService] Fetching GDACS disaster data...");

        // Step 1: Fetch raw response as String for safe debug logging
        String rawResponse;
        try {
            rawResponse = restTemplate.getForObject(GDACS_URL, String.class);
            log.info("GDACS Raw Response Length: {}", rawResponse != null ? rawResponse.length() : 0);
        } catch (Exception e) {
            log.error("Failed to fetch GDACS data: {}", e.getMessage());
            return;
        }

        if (rawResponse == null || rawResponse.isBlank()) {
            log.warn("No features returned from GDACS.");
            return;
        }

        // Step 2: Deserialise raw JSON into GdacsResponse
        ObjectMapper mapper = new ObjectMapper();
        GdacsResponse response;
        try {
            response = mapper.readValue(rawResponse, GdacsResponse.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse GDACS response: {}", e.getMessage());
            return;
        }

        log.info("GDACS response received.");
        log.info("Feature count: {}",
                response.getFeatures() != null ? response.getFeatures().size() : 0);

        if (response.getFeatures() == null) {
            log.warn("No features returned from GDACS.");
            return;
        }

        int saved = 0;
        int skipped = 0;

        for (GdacsEvent event : response.getFeatures()) {

            // --- Guard: skip events with missing properties or geometry ---
            if (event.getProperties() == null || event.getGeometry() == null) {
                skipped++;
                continue;
            }

            String country = event.getProperties().getCountry();

            // --- Filter to India only ---
            if (country == null ||
                    !(country.equalsIgnoreCase("India") || country.equalsIgnoreCase("IN")
                            || country.equalsIgnoreCase("IND"))) {
                skipped++;
                continue;
            }

            // --- Deduplicate by externalId ---
            String externalId = event.getProperties().getEventid();
            if (externalId == null || intelRepo.existsByExternalId(externalId)) {
                skipped++;
                continue;
            }

            // --- Guard: coordinates must have at least 2 elements ---
            List<Double> coords = event.getGeometry().getCoordinates();
            if (coords == null || coords.size() < 2) {
                skipped++;
                continue;
            }

            IntelAlert alert = new IntelAlert();
            alert.setExternalId(externalId);
            alert.setType(event.getProperties().getEventtype());
            alert.setCountry("India"); // Normalize to India for consistency with controller queries
            alert.setSeverity(event.getProperties().getAlertlevel());
            // GeoJSON order: [longitude, latitude]
            alert.setLongitude(coords.get(0));
            alert.setLatitude(coords.get(1));

            intelRepo.save(alert);
            saved++;
        }

        log.info("[IntelImportService] Done. Saved: {}, Skipped: {}", saved, skipped);
    }
}

package com.india.idro.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.india.idro.model.IntelAlert;
import com.india.idro.repository.IntelAlertRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsgsImportService {

    private static final Logger log = LoggerFactory.getLogger(UsgsImportService.class);

    private final IntelAlertRepository intelRepo;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
            "&minmagnitude=4" +
            "&minlatitude=8&maxlatitude=37" +
            "&minlongitude=68&maxlongitude=97" +
            "&orderby=time&limit=20";

    @Scheduled(fixedRate = 30000)
    public void fetchIndiaEarthquakes() {
        log.info("[UsgsImportService] Fetching USGS earthquake data for India...");

        String rawResponse;
        try {
            rawResponse = restTemplate.getForObject(USGS_URL, String.class);
        } catch (Exception e) {
            log.error("[UsgsImportService] Failed to fetch USGS data: {}", e.getMessage());
            return;
        }

        if (rawResponse == null || rawResponse.isBlank()) {
            log.warn("[UsgsImportService] Empty response from USGS.");
            return;
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root;
        try {
            root = mapper.readTree(rawResponse);
        } catch (Exception e) {
            log.error("[UsgsImportService] Failed to parse USGS JSON: {}", e.getMessage());
            return;
        }

        JsonNode features = root.path("features");
        if (features.isMissingNode() || !features.isArray()) {
            log.warn("[UsgsImportService] No features array in USGS response.");
            return;
        }

        int saved = 0;
        int skipped = 0;

        for (JsonNode feature : features) {
            JsonNode props = feature.path("properties");
            JsonNode geometry = feature.path("geometry");

            if (props.isMissingNode() || geometry.isMissingNode()) {
                skipped++;
                continue;
            }

            String externalId = "USGS_" + feature.path("id").asText();
            if (externalId.equals("USGS_") || intelRepo.existsByExternalId(externalId)) {
                skipped++;
                continue;
            }

            JsonNode coords = geometry.path("coordinates");
            if (!coords.isArray() || coords.size() < 2) {
                skipped++;
                continue;
            }

            String alertLevel = props.path("alert").asText(null);
            String severity = mapUsgsAlert(alertLevel, props.path("mag").asDouble(0));

            String place = props.path("place").asText("");

            if (!place.toLowerCase().endsWith(", india")) {
                skipped++;
                log.debug("[UsgsImportService] Skipping non-India event: {}", place);
                continue;
            }

            IntelAlert alert = new IntelAlert();
            alert.setExternalId(externalId);
            alert.setType("EQ");
            alert.setCountry("India");
            alert.setSeverity(severity);
            alert.setSource("USGS");
            alert.setLongitude(coords.get(0).asDouble());
            alert.setLatitude(coords.get(1).asDouble());

            intelRepo.save(alert);
            saved++;
            log.info("[UsgsImportService] Saved: {} | Mag: {} | Place: {}",
                    externalId, props.path("mag").asDouble(), place);
        }

        log.info("[UsgsImportService] Done. Saved: {}, Skipped: {}", saved, skipped);
    }

    private String mapUsgsAlert(String usgsAlert, double magnitude) {
        if ("red".equalsIgnoreCase(usgsAlert))
            return "Red";
        if ("orange".equalsIgnoreCase(usgsAlert))
            return "Orange";
        if ("yellow".equalsIgnoreCase(usgsAlert))
            return "Orange";
        if ("green".equalsIgnoreCase(usgsAlert))
            return "Green";
        if (magnitude >= 6.0)
            return "Red";
        if (magnitude >= 5.0)
            return "Orange";
        return "Orange";
    }
}

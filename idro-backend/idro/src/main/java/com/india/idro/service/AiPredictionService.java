package com.india.idro.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AiPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(AiPredictionService.class);
    private final String ML_API_URL = "http://127.0.0.1:8000/predict";
    private final RestTemplate restTemplate;

    public AiPredictionService() {
        // Configure RestTemplate with timeouts to prevent hanging
        // Connection timeout: 5 seconds (time to establish connection)
        // Read timeout: 30 seconds (time to wait for ML prediction response)
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds
        factory.setReadTimeout(30000); // 30 seconds

        this.restTemplate = new RestTemplate(factory);
        logger.info("AiPredictionService initialized with ML API URL: {} (Connection timeout: 5s, Read timeout: 30s)",
                ML_API_URL);
    }

    // --- Public Methods ---

    /**
     * Get predictions for a specific Alert (Disaster Event).
     */
    public com.india.idro.dto.AiPredictionResponseDTO getPrediction(com.india.idro.model.Alert alert) {
        try {
            com.india.idro.dto.AiPredictionRequestDTO request = new com.india.idro.dto.AiPredictionRequestDTO();

            // Map Alert fields to DTO
            request.setDisasterType(alert.getType() != null ? alert.getType().toString() : "Unknown");
            request.setSeverity(alert.getMagnitude() != null ? alert.getMagnitude() : "Unknown"); // Using Magnitude as
                                                                                                  // Severity proxy
            request.setUrgency(alert.getUrgency() != null ? alert.getUrgency() : "Medium");
            request.setAffectedCount(alert.getAffectedCount());
            request.setInjuredCount(alert.getInjuredCount());

            // Handle missing count parsing (String to int)
            try {
                request.setMissingCount(Integer.parseInt(alert.getMissing()));
            } catch (NumberFormatException e) {
                request.setMissingCount(0);
            }

            request.setLatitude(alert.getLatitude() != null ? alert.getLatitude() : 0.0);
            request.setLongitude(alert.getLongitude() != null ? alert.getLongitude() : 0.0);

            return callMlServer(request);

        } catch (Exception e) {
            logger.error("Failed to prepare prediction request for Alert ID: {}", alert.getId(), e);
            return null; // Return null so controller can handle fallback
        }
    }

    /**
     * Get predictions for a specific Camp.
     */
    public com.india.idro.dto.AiPredictionResponseDTO getPrediction(com.india.idro.model.Camp camp) {
        try {
            com.india.idro.dto.AiPredictionRequestDTO request = new com.india.idro.dto.AiPredictionRequestDTO();

            // Map Camp fields to DTO (using defaults where Camp lacks specific disaster
            // details)
            request.setDisasterType("Relief Camp"); // Generic type for camps
            request.setSeverity("Moderate"); // Default
            request.setUrgency(camp.getUrgency() != null ? camp.getUrgency() : "Medium");
            request.setAffectedCount(camp.getPopulation() != null ? camp.getPopulation() : 0);
            request.setInjuredCount(0); // Camps usually focus on displaced, not immediate triage
            request.setMissingCount(0);

            request.setLatitude(camp.getLatitude() != null ? camp.getLatitude() : 0.0);
            request.setLongitude(camp.getLongitude() != null ? camp.getLongitude() : 0.0);

            return callMlServer(request);

        } catch (Exception e) {
            logger.error("Failed to prepare prediction request for Camp ID: {}", camp.getId(), e);
            return null;
        }
    }

    /**
     * Get predictions for a specific Camp, using the parent Alert's context.
     */
    public com.india.idro.dto.AiPredictionResponseDTO getPrediction(com.india.idro.model.Camp camp,
            com.india.idro.model.Alert context) {
        try {
            com.india.idro.dto.AiPredictionRequestDTO request = new com.india.idro.dto.AiPredictionRequestDTO();

            // Use parent Alert's disaster details
            request.setDisasterType(context.getType() != null ? context.getType().toString() : "Unknown");
            request.setSeverity(context.getMagnitude() != null ? context.getMagnitude() : "Moderate");
            request.setUrgency(context.getUrgency() != null ? context.getUrgency() : "Medium");

            // Use Camp's population
            request.setAffectedCount(camp.getPopulation() != null ? camp.getPopulation() : 0);
            request.setInjuredCount(0); // Camps usually focus on displaced
            request.setMissingCount(0);

            // Use Camp's location
            request.setLatitude(camp.getLatitude() != null ? camp.getLatitude() : 0.0);
            request.setLongitude(camp.getLongitude() != null ? camp.getLongitude() : 0.0);

            return callMlServer(request);

        } catch (Exception e) {
            logger.error("Failed to prepare prediction request for Camp ID: {} with Context: {}", camp.getId(),
                    context.getId(), e);
            return null;
        }
    }

    // --- Private Helper ---

    private com.india.idro.dto.AiPredictionResponseDTO callMlServer(com.india.idro.dto.AiPredictionRequestDTO request) {
        try {
            logger.info("Sending prediction request to ML Server: {}", request);

            com.india.idro.dto.AiPredictionResponseDTO response = restTemplate.postForObject(
                    ML_API_URL,
                    request,
                    com.india.idro.dto.AiPredictionResponseDTO.class);

            logger.info("Received prediction response: {}", response);
            return response;

        } catch (Exception e) {
            logger.error("Error calling ML Server at {}: {}", ML_API_URL, e.getMessage());
            // In a real scenario, we might return a fallback object here too
            return null;
        }
    }
}

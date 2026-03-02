package com.india.idro.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.india.idro.dto.AiPredictionRequestDTO;
import com.india.idro.dto.AiPredictionResponseDTO;

/**
 * Service for calling the FastAPI ML server.
 * 
 * Responsibilities:
 * - Send POST requests to ML server /predict endpoint
 * - Handle network errors gracefully
 * - Log all ML communication
 * 
 * Does NOT contain:
 * - Business logic
 * - Database operations
 * - Entity-to-DTO mapping
 */
@Service
public class MlPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(MlPredictionService.class);

    // ML Server Configuration
    private static final String ML_API_URL = "http://localhost:8000/predict";
    private static final int CONNECTION_TIMEOUT_MS = 5000; // 5 seconds
    private static final int READ_TIMEOUT_MS = 30000; // 30 seconds

    private final RestTemplate restTemplate;

    /**
     * Constructor - Initializes RestTemplate with timeout configuration.
     */
    public MlPredictionService() {
        // Configure HTTP client with timeouts to prevent hanging
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECTION_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);

        this.restTemplate = new RestTemplate(factory);

        logger.info("MlPredictionService initialized");
        logger.info("ML API URL: {}", ML_API_URL);
        logger.info("Connection timeout: {}ms, Read timeout: {}ms",
                CONNECTION_TIMEOUT_MS, READ_TIMEOUT_MS);
    }

    /**
     * Call ML server to get resource predictions.
     * 
     * @param request The prediction request containing disaster details
     * @return ML prediction response, or null if ML server is unavailable
     */
    public AiPredictionResponseDTO predict(AiPredictionRequestDTO request) {
        if (request == null) {
            logger.error("Prediction request is null");
            return null;
        }

        try {
            logger.debug("Sending prediction request to ML server: {}", request);

            // POST request to ML server
            AiPredictionResponseDTO response = restTemplate.postForObject(
                    ML_API_URL,
                    request,
                    AiPredictionResponseDTO.class);

            if (response != null) {
                logger.info("✅ ML prediction successful - Source: {}, Risk: {}",
                        response.getPredictionSource(),
                        response.getRiskScore());
                logger.debug("Full ML response: {}", response);
            } else {
                logger.warn("ML server returned null response");
            }

            return response;

        } catch (RestClientException e) {
            // Network errors, timeouts, HTTP errors
            logger.error("❌ Failed to call ML server at {}: {}",
                    ML_API_URL, e.getMessage());
            logger.debug("ML server error details", e);
            return null;

        } catch (Exception e) {
            // Unexpected errors
            logger.error("❌ Unexpected error during ML prediction: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Check if ML server is reachable.
     * 
     * @return true if ML server responds, false otherwise
     */
    public boolean isAvailable() {
        try {
            // Simple health check - could be improved with a dedicated /health endpoint
            logger.debug("Checking ML server availability at {}", ML_API_URL);
            restTemplate.getForObject(ML_API_URL.replace("/predict", "/"), String.class);
            return true;
        } catch (Exception e) {
            logger.warn("ML server is not available: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get the configured ML API URL.
     * 
     * @return ML server URL
     */
    public String getMlApiUrl() {
        return ML_API_URL;
    }
}

package com.india.idro.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.india.idro.dto.AiPredictionRequestDTO;
import com.india.idro.dto.AiPredictionResponseDTO;

@Service
public class MlPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(MlPredictionService.class);

    private static final String ML_API_URL = "http://localhost:8000/predict";
    private static final int CONNECTION_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 30000;

    private final RestTemplate restTemplate;

    public MlPredictionService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECTION_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);

        this.restTemplate = new RestTemplate(factory);

        logger.info("MlPredictionService initialized");
        logger.info("ML API URL: {}", ML_API_URL);
        logger.info("Connection timeout: {}ms, Read timeout: {}ms",
                CONNECTION_TIMEOUT_MS, READ_TIMEOUT_MS);
    }

    public AiPredictionResponseDTO predict(AiPredictionRequestDTO request) {
        if (request == null) {
            logger.error("Prediction request is null");
            return null;
        }

        try {
            logger.debug("Sending prediction request to ML server: {}", request);

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
            logger.error("❌ Failed to call ML server at {}: {}",
                    ML_API_URL, e.getMessage());
            logger.debug("ML server error details", e);
            return null;

        } catch (Exception e) {
            logger.error("❌ Unexpected error during ML prediction: {}", e.getMessage(), e);
            return null;
        }
    }

    public boolean isAvailable() {
        try {
            logger.debug("Checking ML server availability at {}", ML_API_URL);
            restTemplate.getForObject(ML_API_URL.replace("/predict", "/"), String.class);
            return true;
        } catch (Exception e) {
            logger.warn("ML server is not available: {}", e.getMessage());
            return false;
        }
    }

    public String getMlApiUrl() {
        return ML_API_URL;
    }
}

package com.india.idro.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for receiving predictions from the Python ML Server.
 * Maps the JSON response from /predict endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionResponseDTO {

    // --- Core Metadata ---

    @JsonProperty("risk_score")
    private Double riskScore;

    @JsonProperty("prediction_source")
    private String predictionSource; // "ML" or "Fallback"

    @JsonProperty("explanation")
    private List<String> explanations;

    // --- Nested Requirements ---

    @JsonProperty("requirements")
    private AiRequirementsDTO requirements;

    // --- Inner Class for Resource Counts ---

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiRequirementsDTO {

        @JsonProperty("food_packets")
        private int foodPacketsPerDay;

        @JsonProperty("water_liters")
        private int waterLitersPerDay;

        @JsonProperty("medical_kits")
        private int medicalKitsRequired;

        @JsonProperty("beds_required")
        private int bedsRequired;

        @JsonProperty("blankets_required")
        private int blanketsRequired;

        @JsonProperty("toilets_required")
        private int toiletsRequired;

        @JsonProperty("power_units_required")
        private int powerUnitsRequired;

        @JsonProperty("ambulances_required")
        private int ambulancesRequired;

        @JsonProperty("volunteers_required")
        private int volunteersRequired;
    }
}

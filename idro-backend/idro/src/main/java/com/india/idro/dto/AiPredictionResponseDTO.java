package com.india.idro.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionResponseDTO {

    @JsonProperty("risk_score")
    private Double riskScore;

    @JsonProperty("prediction_source")
    private String predictionSource;

    @JsonProperty("explanation")
    private List<String> explanations;

    @JsonProperty("requirements")
    private AiRequirementsDTO requirements;

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

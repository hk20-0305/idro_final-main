package com.india.idro.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sending disaster details to the AI Prediction Service.
 * Matches the JSON structure expected by the ML Server /predict endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionRequestDTO {

    // --- Disaster Classification ---

    @JsonProperty("disaster_type")
    private String disasterType; // e.g., "Flood", "Earthquake"

    @JsonProperty("severity")
    private String severity; // e.g., "High", "Critical"

    @JsonProperty("urgency")
    private String urgency; // e.g., "Immediate"

    // --- Casualty & Impact Data ---

    @JsonProperty("affected_count")
    private int affectedCount;

    @JsonProperty("injured_count")
    private int injuredCount;

    @JsonProperty("missing_count")
    private int missingCount;

    // --- Geolocation ---

    @JsonProperty("latitude")
    private double latitude;

    @JsonProperty("longitude")
    private double longitude;
}

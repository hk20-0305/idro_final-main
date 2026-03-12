package com.india.idro.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionRequestDTO {

    @JsonProperty("disaster_type")
    private String disasterType;

    @JsonProperty("severity")
    private String severity;

    @JsonProperty("urgency")
    private String urgency;

    @JsonProperty("affected_count")
    private int affectedCount;

    @JsonProperty("injured_count")
    private int injuredCount;

    @JsonProperty("missing_count")
    private int missingCount;

    @JsonProperty("latitude")
    private double latitude;

    @JsonProperty("longitude")
    private double longitude;
}

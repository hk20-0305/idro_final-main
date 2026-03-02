package com.india.idro.dto;

import com.india.idro.model.Stock;
import com.india.idro.model.enums.CampStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCampRequest {

    @NotBlank(message = "Camp name is required")
    private String name;

    @NotNull(message = "Camp status is required")
    private CampStatus status;

    @NotNull(message = "Urgency score is required")
    @Min(value = 0, message = "Urgency score must be between 0 and 100")
    @Max(value = 100, message = "Urgency score must be between 0 and 100")
    private Integer urgencyScore;

    private String urgency;

    @NotNull(message = "Population is required")
    @Min(value = 0, message = "Population must be positive")
    private Integer population;

    @Min(value = 0, message = "Injured count must be at least 0")
    private Integer injuredCount;

    private boolean medicinesNeeded;

    private Stock stock;

    private String incomingAid;

    private String image;

    private Double latitude;

    private Double longitude;
}
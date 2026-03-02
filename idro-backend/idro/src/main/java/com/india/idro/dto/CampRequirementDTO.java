package com.india.idro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampRequirementDTO {
    private int foodPacketsPerDay;
    private int waterLitersPerDay;
    private int bedsRequired;
    private int medicalKitsRequired;
    private int toiletsRequired;
    private int volunteersRequired;
    private int ambulancesRequired;
}

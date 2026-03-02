package com.india.idro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BaseResourceRequirement {

    private int foodPacketsPerDay;
    private int waterLitersPerDay;
    private int bedsRequired;
    private int medicalKitsRequired;
    private int blanketsRequired;
    private int toiletsRequired;
    private int powerUnitsRequired;
    private int ambulancesRequired;
    private int volunteersRequired;
}

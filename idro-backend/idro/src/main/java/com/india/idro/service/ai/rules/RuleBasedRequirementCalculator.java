package com.india.idro.service.ai.rules;

import org.springframework.stereotype.Service;

import com.india.idro.dto.CampRequirementDTO;
import com.india.idro.model.Camp;

@Service
public class RuleBasedRequirementCalculator {

    public CampRequirementDTO calculateRequirements(Camp camp) {
        int currentPeople = camp.getPopulation() != null ? camp.getPopulation() : 0;
        int injuredCount = camp.getInjuredCount();
        boolean medicinesNeeded = camp.isMedicinesNeeded();
        String severity = camp.getSeverity() != null ? camp.getSeverity() : "NORMAL";

        int foodPackets = currentPeople * 3;
        int waterLiters = currentPeople * 3;

        int bedsRequired = injuredCount;

        int medicalKitsRequired = medicinesNeeded ? injuredCount : 0;

        int ambulancesRequired = 0;
        if (injuredCount > 0) {
            ambulancesRequired = 1;
        }
        if ("CRITICAL".equalsIgnoreCase(severity) && injuredCount > 50) {
            ambulancesRequired = 2;
        }

        int volunteersRequired = (int) Math.ceil((double) currentPeople / 50);

        int toiletsRequired = (int) Math.ceil((double) currentPeople / 20);

        return CampRequirementDTO.builder()
                .foodPacketsPerDay(foodPackets)
                .waterLitersPerDay(waterLiters)
                .bedsRequired(bedsRequired)
                .medicalKitsRequired(medicalKitsRequired)
                .toiletsRequired(toiletsRequired)
                .volunteersRequired(volunteersRequired)
                .ambulancesRequired(ambulancesRequired)
                .build();
    }
}

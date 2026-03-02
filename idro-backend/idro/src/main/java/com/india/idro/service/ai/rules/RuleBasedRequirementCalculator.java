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

        // 1. Food & Water (Deterministic Ratio: 3 per person)
        int foodPackets = currentPeople * 3;
        int waterLiters = currentPeople * 3;

        // 2. Beds Rule (Set beds equal to injured count)
        int bedsRequired = injuredCount;

        // 3. Medical Kits Rule
        int medicalKitsRequired = medicinesNeeded ? injuredCount : 0;

        // 4. Ambulance Rule
        int ambulancesRequired = 0;
        if (injuredCount > 0) {
            ambulancesRequired = 1;
        }
        if ("CRITICAL".equalsIgnoreCase(severity) && injuredCount > 50) {
            ambulancesRequired = 2;
        }

        // 5. Volunteers Rule (1 per 50 people)
        int volunteersRequired = (int) Math.ceil((double) currentPeople / 50);

        // 6. Toilets (Preserving existing ratio if not specified otherwise, usually 1
        // per 20)
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

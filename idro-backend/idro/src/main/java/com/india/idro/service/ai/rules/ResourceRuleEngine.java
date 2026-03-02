package com.india.idro.service.ai.rules;

import static com.india.idro.service.ai.rules.ResourceStandardConstants.*;

import org.springframework.stereotype.Service;

import com.india.idro.dto.BaseResourceRequirement;

@Service
public class ResourceRuleEngine {

    public BaseResourceRequirement calculateBaseRequirements(int affectedPeople, int injuredPeople) {
        return BaseResourceRequirement.builder()
                .foodPacketsPerDay(affectedPeople * FOOD_PACKETS_PER_PERSON_PER_DAY)
                .waterLitersPerDay(affectedPeople * WATER_LITERS_PER_PERSON_PER_DAY)
                .bedsRequired((int) Math.ceil(injuredPeople * BED_PER_INJURED_RATIO))
                .medicalKitsRequired((int) Math.ceil((double) injuredPeople / 20)) // Defaulting as
                                                                                   // MEDICAL_KITS_PER_INJURED was
                                                                                   // removed in user request
                .blanketsRequired(affectedPeople * 1) // Defaulting as BLANKETS_PER_PERSON was removed
                .toiletsRequired((int) Math.ceil((double) affectedPeople / TOILET_PER_PERSON_RATIO))
                .powerUnitsRequired((int) Math.ceil((double) affectedPeople / 150)) // Defaulting as POWER_UNIT was
                                                                                    // removed
                .ambulancesRequired((int) Math.ceil((double) injuredPeople / AMBULANCE_PER_INJURED_RATIO))
                .volunteersRequired((int) Math.ceil((double) affectedPeople / VOLUNTEER_PER_PERSON_RATIO))
                .build();
    }
}

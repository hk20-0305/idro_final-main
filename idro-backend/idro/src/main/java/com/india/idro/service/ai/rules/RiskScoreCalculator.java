package com.india.idro.service.ai.rules;

import org.springframework.stereotype.Service;

import com.india.idro.model.Camp;

@Service
public class RiskScoreCalculator {

    public int calculateRuleRisk(Camp camp, int supplyHours) {
        int severityScore = calculateSeverityScore(camp.getSeverity());
        int urgencyScore = calculateUrgencyScore(supplyHours);
        int populationScore = calculatePopulationScore(camp.getPopulation());

        return severityScore + urgencyScore + populationScore;
    }

    private int calculateSeverityScore(String severity) {
        if (severity == null)
            return 10;
        return switch (severity.toUpperCase()) {
            case "CRITICAL" -> 40;
            case "HIGH" -> 30;
            case "MODERATE" -> 20;
            default -> 10; // LOW or others
        };
    }

    private int calculateUrgencyScore(int supplyHours) {
        if (supplyHours <= 6)
            return 40;
        if (supplyHours <= 12)
            return 20;
        if (supplyHours <= 24)
            return 10;
        return 5; // Fallback
    }

    private int calculatePopulationScore(Integer population) {
        if (population == null || population <= 500)
            return 10;
        if (population <= 1000)
            return 20;
        return 30;
    }
}

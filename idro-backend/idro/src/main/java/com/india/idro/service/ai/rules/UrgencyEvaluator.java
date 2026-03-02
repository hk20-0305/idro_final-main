package com.india.idro.service.ai.rules;

import org.springframework.stereotype.Service;

@Service
public class UrgencyEvaluator {

    public int convertUrgencyToHours(String urgency) {
        if (urgency == null) {
            return 12; // Default
        }

        switch (urgency.toLowerCase()) {
            case "immediate":
            case "6 hours":
                return 6;
            case "12 hours":
                return 12;
            case "24 hours":
                return 24;
            default:
                return 12; // Default
        }
    }
}

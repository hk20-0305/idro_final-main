package com.india.idro.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.india.idro.model.Alert;
import com.india.idro.model.enums.UserRole;
import com.india.idro.repository.AlertRepository;
import com.india.idro.repository.CampRepository;
import com.india.idro.repository.UserRepository;

@Service
public class AnalyticsService {
    

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private CampRepository campRepository;

    @Autowired
    private UserRepository userRepository;

    // --- 1. Impact Analysis (UPDATED WITH AI LOGIC) ---
    public Map<String, Object> calculateImpact(Alert alert) {
        int people = alert.getAffectedCount();
        int injured = alert.getInjuredCount();

        // Safety check to handle type conversion
        String type = (alert.getType() != null) ? alert.getType().toString() : "";

        Map<String, Object> impact = new HashMap<>();

        // Existing Calculations
        impact.put("foodPerDay", people * 2);
        impact.put("waterPerDay", people * 3);
        impact.put("medicalTeams", (int) Math.ceil((double) injured / 40));
        impact.put("ambulances", (int) Math.ceil((double) injured / 25));
        impact.put("volunteers", (int) Math.ceil((double) people / 30));

        // --- NEW SMART LOGIC ADDED HERE ---

        // 1. Shelter Shortfall: Assume 40% of affected people have lost homes
        impact.put("shelterShortfall", (int) (people * 0.4));

        // 2. Rescue Boats: Only required for Water Disasters (Flood/Cyclone)
        // Logic: 1 Boat per 200 people
        if ("FLOOD".equalsIgnoreCase(type) || "CYCLONE".equalsIgnoreCase(type)) {
            impact.put("rescueBoats", (int) Math.ceil((double) people / 200));
        } else {
            impact.put("rescueBoats", 0); // No boats needed for Fire/Earthquake
        }

        return impact;
    }

    // --- 2. Dashboard Stats ---
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalThreats = alertRepository.count();
        long activeCamps = campRepository.count();
        long volunteers = userRepository.countByRole(UserRole.VOLUNTEER);

        stats.put("totalThreats", totalThreats);
        stats.put("activeCamps", activeCamps);
        stats.put("volunteers", volunteers);
        stats.put("systemStatus", "ONLINE");

        return stats;
    }

    // --- 3. AI Prediction ---
    public Map<String, String> predictNextThreat() {
        Map<String, String> prediction = new HashMap<>();

        long recentAlerts = alertRepository.count();

        if (recentAlerts > 5) {
            prediction.put("status", "HIGH RISK");
            prediction.put("message", "Cyclone Formation Likely in Bay of Bengal");
        } else {
            prediction.put("status", "STABLE");
            prediction.put("message", "No Immediate Threats Detected");
        }

        return prediction;
    }
}
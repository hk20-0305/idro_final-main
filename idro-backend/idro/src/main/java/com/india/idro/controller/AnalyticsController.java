package com.india.idro.controller;

import com.india.idro.model.Alert;
import com.india.idro.repository.AlertRepository;
import com.india.idro.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*") // ✅ ALLOW ALL PORTS (Fixes "Loading..." if port changes)
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private AlertRepository alertRepository;

    @GetMapping("/impact/{id}")
    public ResponseEntity<Map<String, Object>> getImpact(@PathVariable String id) {
        // ✅ SAFER LOGIC: Returns 404 if ID is wrong, instead of crashing with RuntimeException
        return alertRepository.findById(id)
                .map(alert -> ResponseEntity.ok(analyticsService.calculateImpact(alert)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/prediction")
    public ResponseEntity<Map<String, String>> getPrediction() {
        return ResponseEntity.ok(analyticsService.predictNextThreat());
    }
}
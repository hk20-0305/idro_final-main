package com.india.idro.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.india.idro.service.ImpactAnalysisService;

@RestController
@RequestMapping("/api/impact-analysis")
@CrossOrigin(origins = "*") // Allow requests from Frontend
public class ImpactAnalysisController {

    private static final Logger logger = LoggerFactory.getLogger(ImpactAnalysisController.class);

    @Autowired
    private ImpactAnalysisService impactAnalysisService;

    /**
     * GET /api/impact-analysis/{missionId}
     * Fetches AI-driven impact analysis for a specific mission/disaster.
     */
    @GetMapping("/{missionId}")
    public ResponseEntity<?> getMissionImpact(@PathVariable String missionId) {
        logger.info("Received request for impact analysis of mission ID: {}", missionId);

        try {
            com.india.idro.dto.ImpactAnalysisResponseDTO analysis = impactAnalysisService
                    .analyzeMissionImpact(missionId);
            return ResponseEntity.ok(analysis);

        } catch (RuntimeException e) {
            logger.error("Error analyzing mission {}: {}", missionId, e.getMessage());
            if (e.getMessage().contains("Mission not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error analyzing mission {}: {}", missionId, e.getMessage());
            return ResponseEntity.internalServerError().body("Unexpected error: " + e.getMessage());
        }
    }
}

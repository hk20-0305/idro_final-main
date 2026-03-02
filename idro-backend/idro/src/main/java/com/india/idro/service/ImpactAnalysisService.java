package com.india.idro.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.india.idro.dto.AiPredictionRequestDTO;
import com.india.idro.dto.AiPredictionResponseDTO;
import com.india.idro.dto.ImpactAnalysisResponseDTO;
import com.india.idro.model.Alert;
import com.india.idro.model.Camp;
import com.india.idro.model.CampAiAnalysis;
import com.india.idro.model.CampAiPrediction;
import com.india.idro.repository.AlertRepository;
import com.india.idro.repository.CampAiPredictionRepository;
import com.india.idro.repository.CampRepository;
import com.india.idro.service.ai.rules.RiskScoreCalculator;
import com.india.idro.service.ai.rules.RuleBasedRequirementCalculator;
import com.india.idro.service.ai.rules.UrgencyEvaluator;

/**
 * Service to orchestrate AI-driven impact analysis.
 * 
 * Flow:
 * 1. Fetch Mission (Alert)
 * 2. Fetch Camps
 * 3. Call ML Server for each Camp
 * 4. Persist Predictions
 * 5. Aggregate Results
 */
@Service
public class ImpactAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(ImpactAnalysisService.class);

    @Autowired
    private MlPredictionService mlPredictionService;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private CampRepository campRepository;

    @Autowired
    private CampAiPredictionRepository predictionRepository;

    /**
     * Orchestrates the AI analysis for all camps under a mission.
     * Returns a structured response with mission stats and camp breakdown.
     * 
     * @param missionId The ID of the mission (Alert) to analyze
     * @return Impact analysis response with camp-wise predictions
     * @throws RuntimeException if mission not found
     */
    public ImpactAnalysisResponseDTO analyzeMissionImpact(String missionId) {
        logger.info("Starting impact analysis for mission ID: {}", missionId);

        ImpactAnalysisResponseDTO response = new ImpactAnalysisResponseDTO();
        List<CampAiAnalysis> campAnalyses = new ArrayList<>();

        try {
            // ============================================================
            // 1. Fetch Mission Context
            // ============================================================
            Alert mission = alertRepository.findById(missionId)
                    .orElseThrow(() -> new RuntimeException("Mission not found with ID: " + missionId));

            // Set Response Metadata from Mission
            response.setMissionId(mission.getId());
            response.setDisasterType(mission.getType() != null ? mission.getType().toString() : "Unknown");
            response.setSeverity(mission.getMagnitude() != null ? mission.getMagnitude() : "Unknown");

            logger.info("✅ Mission loaded: {} (Type: {}, Severity: {})",
                    mission.getId(), response.getDisasterType(), response.getSeverity());

            // ============================================================
            // 2. Fetch Camps
            // ============================================================
            List<Camp> camps = campRepository.findByAlertId(missionId);
            if (camps == null)
                camps = new ArrayList<>();

            logger.info("Analyzing {} camps for mission {}", camps.size(), missionId);

            // ============================================================
            // 3. Process Each Camp (Async)
            // ============================================================
            List<CompletableFuture<CampAiAnalysis>> futures = camps.stream()
                    .map(camp -> CompletableFuture.supplyAsync(() -> processCamp(camp, mission)))
                    .collect(Collectors.toList());

            // Wait for all to complete
            campAnalyses = futures.stream()
                    .map(CompletableFuture::join)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());

            // ============================================================
            // 4. Aggregate & Populate Response
            // ============================================================
            response.setCampAnalysisList(campAnalyses);

            logger.info("✅ Analysis complete for mission {}", missionId);

        } catch (Exception e) {
            logger.error("Error during impact analysis: {}", e.getMessage(), e);
            // Ensure non-null listing on error
            if (response.getCampAnalysisList() == null) {
                response.setCampAnalysisList(new ArrayList<>());
            }
            // Rethrow if mission not found
            if (e instanceof RuntimeException && e.getMessage().contains("Mission not found")) {
                throw (RuntimeException) e;
            }
        }

        // Final safety check
        if (response.getCampAnalysisList() == null) {
            response.setCampAnalysisList(new ArrayList<>());
        }

        return response;
    }

    /**
     * Process a single camp: Predict -> Save -> Map
     */
    @Autowired
    private RuleBasedRequirementCalculator ruleBasedCalculator;

    @Autowired
    private UrgencyEvaluator urgencyEvaluator;

    @Autowired
    private RiskScoreCalculator riskScoreCalculator;

    /**
     * Process a single camp: Rule Engine (Primary) + ML (Metadata)
     */
    private CampAiAnalysis processCamp(Camp camp, Alert mission) {
        try {
            // 1. Context Setup
            String urgencyStr = camp.getUrgency();
            if (urgencyStr == null || urgencyStr.isEmpty()) {
                urgencyStr = mission.getUrgency() != null ? mission.getUrgency() : "24 Hours";
            }
            camp.setSeverity(mission.getMagnitude());
            // No longer overriding camp.urgency here as it's the field's data source
            int supplyHours = urgencyEvaluator.convertUrgencyToHours(urgencyStr);

            // 2. Rule Engine Calculation (Source of Truth for quantities)
            com.india.idro.dto.CampRequirementDTO ruleResult = ruleBasedCalculator.calculateRequirements(camp);

            // 3. Initialize Analysis DTO
            CampAiAnalysis analysis = new CampAiAnalysis();
            analysis.setCampId(camp.getId());
            analysis.setCampName(camp.getName());
            analysis.setPopulation(camp.getPopulation() != null ? camp.getPopulation() : 0);
            analysis.setInjuredCount(camp.getInjuredCount());
            analysis.setUrgency(urgencyStr);

            // 4. Strict Operational Requirements (Single Source of Truth - Mandated
            // Formulas)
            int population = analysis.getPopulation();
            int injured = analysis.getInjuredCount();

            analysis.setFoodPackets(population * 3);
            analysis.setWaterLiters(population * 5);
            analysis.setBeds(injured);
            analysis.setMedicalKits((int) Math.ceil(injured / 2.0));

            // Rule Engine base for others
            analysis.setVolunteers(ruleResult.getVolunteersRequired());
            analysis.setAmbulances((int) Math.ceil(injured / 4.0));

            // 5. Generate Concise, Rule-Based Explanations
            analysis.setExplanations(generateRuleExplanations(camp, ruleResult, urgencyStr));

            // 6. ML Call & Hybrid Integration (Safety-First Merging)
            try {
                AiPredictionRequestDTO request = new AiPredictionRequestDTO();
                request.setDisasterType(mission.getType() != null ? mission.getType().toString() : "Unknown");
                request.setSeverity(mission.getMagnitude() != null ? mission.getMagnitude() : "Moderate");
                request.setUrgency(mission.getUrgency() != null ? mission.getUrgency() : "Medium");
                request.setAffectedCount(population);
                request.setInjuredCount(injured);
                request.setLatitude(camp.getLatitude() != null ? camp.getLatitude() : 0.0);
                request.setLongitude(camp.getLongitude() != null ? camp.getLongitude() : 0.0);

                AiPredictionResponseDTO mlResponse = mlPredictionService.predict(request);

                if (mlResponse != null && mlResponse.getRequirements() != null) {
                    analysis.setPredictionSource("Hybrid AI");
                }
            } catch (Exception mlEx) {
                logger.warn("ML fallback to Rule Engine for camp {}: {}", camp.getId(), mlEx.getMessage());
                analysis.setPredictionSource("Rule Engine");
            }

            // 9. Persist Prediction (mapped back to entity fields)
            savePrediction(mission.getId(), camp.getId(), analysis, ruleResult);

            return analysis;

        } catch (Exception e) {
            logger.error("Failed to process camp {}: {}", camp.getId(), e.getMessage());
        }
        return null;
    }

    /**
     * Generates concise, operational, human-readable bullet points based on rules.
     */
    private List<String> generateRuleExplanations(Camp camp, com.india.idro.dto.CampRequirementDTO rules,
            String urgency) {
        List<String> explanations = new ArrayList<>();

        // Rule 1: Always mention affected people count
        int population = camp.getPopulation() != null ? camp.getPopulation() : 0;
        explanations.add(population + " people require daily food and water support");

        // Rule 2: Mention injured count only if injured > 0
        if (camp.getInjuredCount() > 0) {
            String medSuffix = rules.getMedicalKitsRequired() > 0 ? " and medical kits" : "";
            explanations.add(camp.getInjuredCount() + " injured require beds" + medSuffix);
        }

        // Rule 3: Mention urgency level
        explanations.add("Urgency level: " + urgency.toUpperCase());

        // Rule 4: Mention ambulance recommendation only if ambulances > 0
        if (rules.getAmbulancesRequired() > 0) {
            explanations.add("Ambulance support required for injured patients");
        }

        return explanations;
    }

    /**
     * Persist prediction to database
     */
    private void savePrediction(String missionId, String campId, CampAiAnalysis analysis,
            com.india.idro.dto.CampRequirementDTO rules) {
        try {
            CampAiPrediction entity = new CampAiPrediction();
            entity.setMissionId(missionId);
            entity.setCampId(campId);

            // Quantities from internal Rules (SSoT Mandated)
            entity.setFoodPerDay(analysis.getFoodPackets());
            entity.setWaterPerDay(analysis.getWaterLiters());
            entity.setMedicalKits(analysis.getMedicalKits());
            entity.setBeds(analysis.getBeds());
            entity.setAmbulances(analysis.getAmbulances());
            entity.setVolunteers(analysis.getVolunteers());

            // Toilets still come from rules (no mandated formula yet)
            entity.setToilets(rules.getToiletsRequired());

            // From Analysis/Rule result
            entity.setUrgency(analysis.getUrgency());
            entity.setPredictionSource(analysis.getPredictionSource());
            entity.setExplanations(analysis.getExplanations());

            predictionRepository.save(entity);

        } catch (Exception e) {
            logger.error("Error saving prediction for camp {}: {}", campId, e.getMessage());
        }
    }
}

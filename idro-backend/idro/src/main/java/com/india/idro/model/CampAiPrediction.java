package com.india.idro.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity to store AI-generated predictions for relief camps.
 * 
 * Relationships:
 * - Links to Mission (Alert) via missionId
 * - Links to Camp via campId
 * 
 * Purpose:
 * - Persist ML predictions for historical analysis
 * - Enable tracking of prediction accuracy over time
 * - Support analytics and reporting
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "camp_ai_predictions")
public class CampAiPrediction {

    @Id
    private String id;

    // ============================================================
    // Relationships
    // ============================================================

    /**
     * Reference to the Mission (Alert) this prediction belongs to.
     * Indexed for fast queries by mission.
     */
    @Indexed
    private String missionId;

    /**
     * Reference to the Camp this prediction is for.
     * Indexed for fast queries by camp.
     */
    @Indexed
    private String campId;

    // ============================================================
    // Resource Predictions (from ML Server)
    // ============================================================

    /**
     * Predicted food packets needed per day
     */
    private Integer foodPerDay;

    /**
     * Predicted water in liters needed per day
     */
    private Integer waterPerDay;

    /**
     * Predicted number of medical kits required
     */
    private Integer medicalKits;

    /**
     * Predicted number of beds/sleeping spaces required
     */
    private Integer beds;

    /**
     * Predicted number of blankets required
     */
    private Integer blankets;

    /**
     * Predicted number of toilet facilities required
     */
    private Integer toilets;

    /**
     * Predicted number of power units/generators required
     */
    private Integer powerUnits;

    /**
     * Predicted number of ambulances required
     */
    private Integer ambulances;

    /**
     * Predicted number of volunteers required
     */
    private Integer volunteers;

    // ============================================================
    // Prediction Metadata
    // ============================================================

    /**
     * Risk score from ML model (0.0 to 100.0)
     * Higher score indicates higher risk/urgency
     */
    private Double riskScore;

    private String riskLevel;

    /**
     * Urgency level from mission/rule engine
     */
    private String urgency;

    /**
     * Source of prediction: "ML" or "Fallback"
     */
    private String predictionSource;

    /**
     * Human-readable explanations from ML model
     * Helps understand why certain predictions were made
     */
    private List<String> explanations;

    // ============================================================
    // Audit Fields
    // ============================================================

    /**
     * Timestamp when this prediction was created
     */
    @CreatedDate
    private LocalDateTime createdAt;

    /**
     * Timestamp when this prediction was last updated
     */
    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * Optional: Actual values observed (for accuracy tracking)
     * Can be populated later to compare predictions vs reality
     */
    private ActualValues actualValues;

    // ============================================================
    // Nested Class for Actual Values (Optional)
    // ============================================================

    /**
     * Stores actual resource usage for comparison with predictions.
     * Used for ML model accuracy tracking and improvement.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActualValues {
        private Integer actualFoodUsed;
        private Integer actualWaterUsed;
        private Integer actualMedicalKitsUsed;
        private Integer actualBedsUsed;
        private Integer actualBlanketsUsed;
        private Integer actualToiletsUsed;
        private Integer actualPowerUnitsUsed;
        private Integer actualAmbulancesUsed;
        private Integer actualVolunteersDeployed;
        private LocalDateTime recordedAt;
    }
}

package com.india.idro.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.india.idro.model.CampAiPrediction;

/**
 * Repository for CampAiPrediction entity.
 * 
 * Provides data access methods for AI predictions.
 */
@Repository
public interface CampAiPredictionRepository extends MongoRepository<CampAiPrediction, String> {

    // ============================================================
    // Query by Relationships
    // ============================================================

    /**
     * Find all predictions for a specific mission.
     * 
     * @param missionId The mission (alert) ID
     * @return List of predictions for the mission
     */
    List<CampAiPrediction> findByMissionId(String missionId);

    /**
     * Find all predictions for a specific camp.
     * 
     * @param campId The camp ID
     * @return List of predictions for the camp
     */
    List<CampAiPrediction> findByCampId(String campId);

    /**
     * Find prediction for a specific camp within a mission.
     * Useful for getting the latest prediction for a camp in a mission.
     * 
     * @param missionId The mission ID
     * @param campId    The camp ID
     * @return Optional prediction
     */
    Optional<CampAiPrediction> findByMissionIdAndCampId(String missionId, String campId);

    // ============================================================
    // Query by Prediction Source
    // ============================================================

    /**
     * Find all predictions from a specific source (ML or Fallback).
     * 
     * @param predictionSource "ML" or "Fallback"
     * @return List of predictions from that source
     */
    List<CampAiPrediction> findByPredictionSource(String predictionSource);

    /**
     * Find predictions for a mission by source.
     * 
     * @param missionId        The mission ID
     * @param predictionSource "ML" or "Fallback"
     * @return List of predictions
     */
    List<CampAiPrediction> findByMissionIdAndPredictionSource(String missionId, String predictionSource);

    // ============================================================
    // Query by Risk Score
    // ============================================================

    /**
     * Find high-risk predictions (risk score above threshold).
     * 
     * @param threshold Minimum risk score (e.g., 70.0)
     * @return List of high-risk predictions
     */
    List<CampAiPrediction> findByRiskScoreGreaterThanEqual(Double threshold);

    /**
     * Find high-risk predictions for a specific mission.
     * 
     * @param missionId The mission ID
     * @param threshold Minimum risk score
     * @return List of high-risk predictions
     */
    List<CampAiPrediction> findByMissionIdAndRiskScoreGreaterThanEqual(String missionId, Double threshold);

    // ============================================================
    // Query by Time Range
    // ============================================================

    /**
     * Find predictions created within a time range.
     * 
     * @param start Start datetime
     * @param end   End datetime
     * @return List of predictions in range
     */
    List<CampAiPrediction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Find predictions for a mission created after a specific time.
     * 
     * @param missionId The mission ID
     * @param after     Datetime threshold
     * @return List of recent predictions
     */
    List<CampAiPrediction> findByMissionIdAndCreatedAtAfter(String missionId, LocalDateTime after);

    // ============================================================
    // Ordering and Sorting
    // ============================================================

    /**
     * Find all predictions for a mission, ordered by risk score (highest first).
     * 
     * @param missionId The mission ID
     * @return List of predictions sorted by risk
     */
    List<CampAiPrediction> findByMissionIdOrderByRiskScoreDesc(String missionId);

    /**
     * Find all predictions for a mission, ordered by creation time (newest first).
     * 
     * @param missionId The mission ID
     * @return List of predictions sorted by time
     */
    List<CampAiPrediction> findByMissionIdOrderByCreatedAtDesc(String missionId);

    // ============================================================
    // Delete Operations
    // ============================================================

    /**
     * Delete all predictions for a specific mission.
     * Useful for cleanup when a mission is closed.
     * 
     * @param missionId The mission ID
     */
    void deleteByMissionId(String missionId);

    /**
     * Delete all predictions for a specific camp.
     * 
     * @param campId The camp ID
     */
    void deleteByCampId(String campId);
}

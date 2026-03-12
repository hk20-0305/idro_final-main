package com.india.idro.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.india.idro.model.CampAiPrediction;

@Repository
public interface CampAiPredictionRepository extends MongoRepository<CampAiPrediction, String> {

    List<CampAiPrediction> findByMissionId(String missionId);

    List<CampAiPrediction> findByCampId(String campId);

    Optional<CampAiPrediction> findByMissionIdAndCampId(String missionId, String campId);

    List<CampAiPrediction> findByPredictionSource(String predictionSource);

    List<CampAiPrediction> findByMissionIdAndPredictionSource(String missionId, String predictionSource);

    List<CampAiPrediction> findByRiskScoreGreaterThanEqual(Double threshold);

    List<CampAiPrediction> findByMissionIdAndRiskScoreGreaterThanEqual(String missionId, Double threshold);

    List<CampAiPrediction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<CampAiPrediction> findByMissionIdAndCreatedAtAfter(String missionId, LocalDateTime after);

    List<CampAiPrediction> findByMissionIdOrderByRiskScoreDesc(String missionId);

    List<CampAiPrediction> findByMissionIdOrderByCreatedAtDesc(String missionId);

    void deleteByMissionId(String missionId);

    void deleteByCampId(String campId);
}

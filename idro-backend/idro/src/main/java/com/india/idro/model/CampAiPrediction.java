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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "camp_ai_predictions")
public class CampAiPrediction {

    @Id
    private String id;

    @Indexed
    private String missionId;

    @Indexed
    private String campId;

    private Integer foodPerDay;

    private Integer waterPerDay;

    private Integer medicalKits;

    private Integer beds;

    private Integer blankets;

    private Integer toilets;

    private Integer powerUnits;

    private Integer ambulances;

    private Integer volunteers;

    private Double riskScore;

    private String riskLevel;

    private String urgency;

    private String predictionSource;

    private List<String> explanations;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private ActualValues actualValues;

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

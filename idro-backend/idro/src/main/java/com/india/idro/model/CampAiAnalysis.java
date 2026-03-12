package com.india.idro.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampAiAnalysis {

    private String campId;
    private String campName;
    private int population;
    private int injuredCount;

    private int foodPackets;
    private int waterLiters;
    private int beds;
    private int medicalKits;
    private int volunteers;
    private int ambulances;

    private String urgency;

    private String predictionSource;
    private List<String> explanations;
}

package com.india.idro.dto;

import lombok.Data;

@Data
public class AnalyticsResponse {
    private int totalAlerts;
    private int activeDisasters;
    private int totalCamps;
    private int civiliansImpacted;
    private String predictedRisk; // LOW, MODERATE, HIGH, CRITICAL
    private String aiInsight1;    // Generated Text
    private String aiInsight2;    // Generated Text
    private double resourceEfficiency; // 0-100%
}
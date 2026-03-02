package com.india.idro.dto;

import java.util.ArrayList;
import java.util.List;

import com.india.idro.model.CampAiAnalysis;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImpactAnalysisResponseDTO {
    private String missionId;
    private String disasterType;
    private String severity;
    private List<CampAiAnalysis> campAnalysisList = new ArrayList<>();
}

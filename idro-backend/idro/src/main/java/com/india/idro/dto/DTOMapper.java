package com.india.idro.dto;

import com.india.idro.model.Alert;
import com.india.idro.model.enums.AlertColor;
import com.india.idro.model.enums.AlertType;
import org.springframework.stereotype.Component;

@Component
public class DTOMapper {

    // Database (Enum) -> Frontend (String)
    public AlertDTO toAlertDTO(Alert alert) {
        if (alert == null) return null;

        AlertDTO dto = new AlertDTO();
        dto.setId(alert.getId());

        // Convert Enum to String safely
        if (alert.getType() != null) {
            dto.setType(alert.getType().name());
        }

        if (alert.getColor() != null) {
            dto.setColor(alert.getColor().name());
        }

        dto.setLocation(alert.getLocation());
        dto.setLatitude(alert.getLatitude());
        dto.setLongitude(alert.getLongitude());
        dto.setMagnitude(alert.getMagnitude());
        dto.setImpact(alert.getImpact());
        dto.setDetails(alert.getDetails());
        dto.setTime(alert.getTime());
        dto.setMissionStatus(alert.getMissionStatus());
        dto.setTrustScore(alert.getTrustScore());
        dto.setSourceType(alert.getSourceType());

        return dto;
    }

    // Frontend (String) -> Database (Enum)
    public Alert toAlertEntity(AlertDTO dto) {
        if (dto == null) return null;

        Alert alert = new Alert();
        alert.setId(dto.getId());

        // Convert String to Enum safely
        try {
            if (dto.getType() != null) {
                alert.setType(AlertType.valueOf(dto.getType().toUpperCase()));
            }
        } catch (IllegalArgumentException e) {
            alert.setType(AlertType.FLOOD); // Default fallback
        }

        try {
            if (dto.getColor() != null) {
                alert.setColor(AlertColor.valueOf(dto.getColor().toUpperCase()));
            }
        } catch (IllegalArgumentException e) {
            alert.setColor(AlertColor.RED); // Default fallback
        }

        alert.setLocation(dto.getLocation());
        alert.setLatitude(dto.getLatitude());
        alert.setLongitude(dto.getLongitude());
        alert.setMagnitude(dto.getMagnitude());
        alert.setImpact(dto.getImpact());
        alert.setDetails(dto.getDetails());
        alert.setTime(dto.getTime());
        alert.setMissionStatus(dto.getMissionStatus());
        alert.setTrustScore(dto.getTrustScore());
        alert.setSourceType(dto.getSourceType());

        return alert;
    }
}
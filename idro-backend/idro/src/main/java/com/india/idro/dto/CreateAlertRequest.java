package com.india.idro.dto;

import com.india.idro.model.enums.AlertColor;
import com.india.idro.model.enums.AlertType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAlertRequest {

    @NotNull(message = "Alert type is required")
    private AlertType type;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Magnitude is required")
    private String magnitude;

    private String details;

    @NotBlank(message = "Impact description is required")
    private String impact;

    @NotNull(message = "Alert color is required")
    private AlertColor color;

    // ✅ Includes BOTH now
    private String time;
    private Double latitude;
    private Double longitude;
}
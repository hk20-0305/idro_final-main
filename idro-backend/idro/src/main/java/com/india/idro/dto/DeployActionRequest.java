package com.india.idro.dto;

import com.india.idro.model.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeployActionRequest {

    @NotNull(message = "User role is required")
    private UserRole role;

    @NotBlank(message = "Target zone is required")
    private String targetZone;

    @NotBlank(message = "Resource type is required")
    private String resourceType;

    @NotBlank(message = "Quantity/Details is required")
    private String quantity;

    private Boolean priority;

    private String userId;
}
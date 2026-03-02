package com.india.idro.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCampStockRequest {

    @NotBlank(message = "Food stock status is required")
    private String food;

    @NotBlank(message = "Water stock status is required")
    private String water;

    @NotBlank(message = "Medicine stock status is required")
    private String medicine;
}
package com.india.idro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stock {
    private String food;      // e.g., "2 days", "10 days"
    private String water;     // e.g., "4 hrs", "12 days"
    private String medicine;  // e.g., "Low", "Full", "Critical"
}
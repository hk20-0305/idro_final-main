package com.india.idro.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import com.india.idro.model.enums.CampStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "camps")
public class Camp {

    @Id
    private String id;

    private String alertId;
    private String location;

    public String getAlertId() {
        return alertId;
    }

    public void setAlertId(String alertId) {
        this.alertId = alertId;
    }

    private String name; // e.g., "Kerala Relief Hub A"
    private CampStatus status; // CRITICAL, STABLE, MODERATE
    private Integer urgencyScore; // 0-100
    private String urgency; // New simplified urgency (Immediate, 6 hours, etc.)
    private Integer population; // Number of people in camp
    private Integer capacity; // Max people camp can hold
    private int injuredCount; // Number of injured people
    private boolean medicinesNeeded; // If true, medical kits are required
    private String severity; // HIGH, MODERATE, LOW
    private Boolean infrastructureDamage; // True if physical damage exists
    private Stock stock; // Embedded document (food, water, medicine)
    private String incomingAid; // e.g., "Seva Foundation > Food Kits (ETA: 2h)"
    private String image; // Image URL (optional)

    // Location coordinates
    private Double latitude;
    private Double longitude;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
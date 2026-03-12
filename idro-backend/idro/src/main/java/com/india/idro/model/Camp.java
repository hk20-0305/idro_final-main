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

    private String name;
    private CampStatus status;
    private Integer urgencyScore;
    private String urgency;
    private Integer population;
    private Integer capacity;
    private int injuredCount;
    private boolean medicinesNeeded;
    private String severity;
    private Boolean infrastructureDamage;
    private Stock stock;
    private String incomingAid;
    private String image;

    private Double latitude;
    private Double longitude;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
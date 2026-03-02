package com.india.idro.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.india.idro.model.enums.AlertColor;
import com.india.idro.model.enums.AlertType;

@Document(collection = "alerts")
public class Alert {

    @Id
    private String id;

    private AlertType type;
    private AlertColor color;
    private String location;
    private Double latitude;
    private Double longitude;
    private String magnitude;
    private String impact;
    private String details;
    private String time;
    private String missionStatus;
    private int trustScore;
    private String reporterLevel;
    private String sourceType;
    private int affectedCount;
    private int injuredCount;
    private String missing;
    private LocalDateTime createdAt;

    // ✅ ADDED STATE FIELD FOR REGIONAL FILTERING
    private String state;
    private String responderName;
    private String urgency;

    // --- GETTERS AND SETTERS ---
    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public AlertType getType() {
        return type;
    }

    public void setType(AlertType type) {
        this.type = type;
    }

    public AlertColor getColor() {
        return color;
    }

    public void setColor(AlertColor color) {
        this.color = color;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getMagnitude() {
        return magnitude;
    }

    public void setMagnitude(String magnitude) {
        this.magnitude = magnitude;
    }

    public String getImpact() {
        return impact;
    }

    public void setImpact(String impact) {
        this.impact = impact;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getMissionStatus() {
        return missionStatus;
    }

    public void setMissionStatus(String missionStatus) {
        this.missionStatus = missionStatus;
    }

    public int getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(int trustScore) {
        this.trustScore = trustScore;
    }

    public String getReporterLevel() {
        return reporterLevel;
    }

    public void setReporterLevel(String reporterLevel) {
        this.reporterLevel = reporterLevel;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public int getAffectedCount() {
        return affectedCount;
    }

    public void setAffectedCount(int affectedCount) {
        this.affectedCount = affectedCount;
    }

    public int getInjuredCount() {
        return injuredCount;
    }

    public void setInjuredCount(int injuredCount) {
        this.injuredCount = injuredCount;
    }

    public String getMissing() {
        return missing;
    }

    public void setMissing(String missing) {
        this.missing = missing;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getResponderName() {
        return responderName;
    }

    public void setResponderName(String responderName) {
        this.responderName = responderName;
    }
}
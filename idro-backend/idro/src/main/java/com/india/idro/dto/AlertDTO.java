package com.india.idro.dto;
public class AlertDTO {

    private String id;

    // Changed to String to prevent "Incompatible Type" errors
    private String type;
    private String color;

    private String location;
    private double latitude;
    private double longitude;

    // New Fields (These were missing, causing "cannot find symbol" errors)
    private String magnitude;
    private String impact;
    private String details;
    private String time;

    private String missionStatus;
    private String responderName;

    private int trustScore;
    private String sourceType;

    // --- GETTERS & SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getMagnitude() { return magnitude; }
    public void setMagnitude(String magnitude) { this.magnitude = magnitude; }

    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getMissionStatus() { return missionStatus; }
    public void setMissionStatus(String missionStatus) { this.missionStatus = missionStatus; }

    public String getResponderName() { return responderName; }
    public void setResponderName(String responderName) { this.responderName = responderName; }

    public int getTrustScore() { return trustScore; }
    public void setTrustScore(int trustScore) { this.trustScore = trustScore; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
}
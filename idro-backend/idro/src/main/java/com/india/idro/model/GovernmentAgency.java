package com.india.idro.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.india.idro.model.enums.AgencyType;
import com.india.idro.model.enums.AvailabilityStatus;
import com.india.idro.model.enums.CoverageRadius;
import com.india.idro.model.enums.ResponseTime;

@Document(collection = "government_agencies")
public class GovernmentAgency {

    @Id
    private String id;

    private String agencyId; // Unique agency identifier (e.g., "NDRF-MH-001")
    private String agencyName; // Name of the agency
    private AgencyType agencyType; // Type of government agency
    private String location; // City/District location
    private String contactNumber; // Emergency contact number
    private String password; // Password for login
    private String operatingRegion; // Region of operation (e.g., "Maharashtra", "Western India")
    private List<String> supportedDisasterTypes; // Types of disasters they handle

    // Resources organized by category
    private Map<String, List<ResourceItem>> resources;

    // Availability and Response Information
    private AvailabilityStatus availabilityStatus;
    private ResponseTime responseTime;
    private CoverageRadius coverageRadius;
    private LocalDateTime lastUpdated;

    // Constructors
    public GovernmentAgency() {
        this.resources = new HashMap<>();
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAgencyId() {
        return agencyId;
    }

    public void setAgencyId(String agencyId) {
        this.agencyId = agencyId;
    }

    public String getAgencyName() {
        return agencyName;
    }

    public void setAgencyName(String agencyName) {
        this.agencyName = agencyName;
    }

    public AgencyType getAgencyType() {
        return agencyType;
    }

    public void setAgencyType(AgencyType agencyType) {
        this.agencyType = agencyType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getOperatingRegion() {
        return operatingRegion;
    }

    public void setOperatingRegion(String operatingRegion) {
        this.operatingRegion = operatingRegion;
    }

    public List<String> getSupportedDisasterTypes() {
        return supportedDisasterTypes;
    }

    public void setSupportedDisasterTypes(List<String> supportedDisasterTypes) {
        this.supportedDisasterTypes = supportedDisasterTypes;
    }

    public Map<String, List<ResourceItem>> getResources() {
        return resources;
    }

    public void setResources(Map<String, List<ResourceItem>> resources) {
        this.resources = resources;
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public ResponseTime getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(ResponseTime responseTime) {
        this.responseTime = responseTime;
    }

    public CoverageRadius getCoverageRadius() {
        return coverageRadius;
    }

    public void setCoverageRadius(CoverageRadius coverageRadius) {
        this.coverageRadius = coverageRadius;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}

package com.india.idro.model;

import com.india.idro.model.enums.AvailabilityStatus;
import com.india.idro.model.enums.CoverageRadius;
import com.india.idro.model.enums.ResponseTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "ngos")
public class NGO {

    @Id
    private String id;

    // Identity Fields (Immutable - Read-only)
    private String ngoId;
    private String password;
    private String ngoName;
    private String city;
    private String state;
    private String contactNumber;
    private String registrationId;
    private String operatingRegion;
    private List<String> supportedDisasterTypes;

    // Resource Fields (Editable)
    private Map<String, ResourceItem> reliefSupplies;
    private Map<String, ResourceItem> medicalSupport;
    private Map<String, ResourceItem> shelterEssentials;
    private Map<String, ResourceItem> humanResources;

    // Availability Fields
    private AvailabilityStatus availabilityStatus;
    private ResponseTime responseTime;
    private CoverageRadius coverageRadius;
    private String additionalNotes;

    // Metadata
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;

    public NGO() {
        this.reliefSupplies = new HashMap<>();
        this.medicalSupport = new HashMap<>();
        this.shelterEssentials = new HashMap<>();
        this.humanResources = new HashMap<>();
        this.supportedDisasterTypes = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
        this.availabilityStatus = AvailabilityStatus.AVAILABLE;
        this.responseTime = ResponseTime.IMMEDIATE;
        this.coverageRadius = CoverageRadius.DISTRICT_WIDE;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNgoId() {
        return ngoId;
    }

    public void setNgoId(String ngoId) {
        this.ngoId = ngoId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNgoName() {
        return ngoName;
    }

    public void setNgoName(String ngoName) {
        this.ngoName = ngoName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(String registrationId) {
        this.registrationId = registrationId;
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

    public Map<String, ResourceItem> getReliefSupplies() {
        return reliefSupplies;
    }

    public void setReliefSupplies(Map<String, ResourceItem> reliefSupplies) {
        this.reliefSupplies = reliefSupplies;
    }

    public Map<String, ResourceItem> getMedicalSupport() {
        return medicalSupport;
    }

    public void setMedicalSupport(Map<String, ResourceItem> medicalSupport) {
        this.medicalSupport = medicalSupport;
    }

    public Map<String, ResourceItem> getShelterEssentials() {
        return shelterEssentials;
    }

    public void setShelterEssentials(Map<String, ResourceItem> shelterEssentials) {
        this.shelterEssentials = shelterEssentials;
    }

    public Map<String, ResourceItem> getHumanResources() {
        return humanResources;
    }

    public void setHumanResources(Map<String, ResourceItem> humanResources) {
        this.humanResources = humanResources;
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

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

package com.india.idro.model;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ngo_resource_submissions")
public class NGOResourceSubmission {

    @Id
    private String id;

    private String ngoId;
    private String ngoName;

    private Map<String, ResourceItem> reliefSupplies;
    private Map<String, ResourceItem> medicalSupport;
    private Map<String, ResourceItem> shelterEssentials;
    private Map<String, ResourceItem> humanResources;

    private String additionalNotes;
    private LocalDateTime submissionTime;

    public NGOResourceSubmission() {
        this.submissionTime = LocalDateTime.now();
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

    public String getNgoName() {
        return ngoName;
    }

    public void setNgoName(String ngoName) {
        this.ngoName = ngoName;
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

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }

    public LocalDateTime getSubmissionTime() {
        return submissionTime;
    }

    public void setSubmissionTime(LocalDateTime submissionTime) {
        this.submissionTime = submissionTime;
    }
}

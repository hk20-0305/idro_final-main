package com.india.idro.dto;

import com.india.idro.model.ResourceItem;

import java.util.Map;

public class ResourceUpdateRequest {
    private String ngoId;
    private Map<String, ResourceItem> reliefSupplies;
    private Map<String, ResourceItem> medicalSupport;
    private Map<String, ResourceItem> shelterEssentials;
    private Map<String, ResourceItem> humanResources;
    private String additionalNotes;

    public ResourceUpdateRequest() {}

    public String getNgoId() {
        return ngoId;
    }

    public void setNgoId(String ngoId) {
        this.ngoId = ngoId;
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
}

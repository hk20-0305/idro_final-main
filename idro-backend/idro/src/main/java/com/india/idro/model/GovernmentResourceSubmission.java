package com.india.idro.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "government_resource_submissions")
public class GovernmentResourceSubmission {

    @Id
    private String id;

    private String agencyId;
    private String agencyName;

    private Map<String, List<ResourceItem>> resources;

    private LocalDateTime submissionTime;

    public GovernmentResourceSubmission() {
        this.submissionTime = LocalDateTime.now();
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

    public Map<String, List<ResourceItem>> getResources() {
        return resources;
    }

    public void setResources(Map<String, List<ResourceItem>> resources) {
        this.resources = resources;
    }

    public LocalDateTime getSubmissionTime() {
        return submissionTime;
    }

    public void setSubmissionTime(LocalDateTime submissionTime) {
        this.submissionTime = submissionTime;
    }
}

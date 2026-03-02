package com.india.idro.dto;

import com.india.idro.model.enums.AvailabilityStatus;
import com.india.idro.model.enums.CoverageRadius;
import com.india.idro.model.enums.ResponseTime;

public class AvailabilityUpdateRequest {
    private String ngoId;
    private AvailabilityStatus availabilityStatus;
    private ResponseTime responseTime;
    private CoverageRadius coverageRadius;

    public AvailabilityUpdateRequest() {}

    public String getNgoId() {
        return ngoId;
    }

    public void setNgoId(String ngoId) {
        this.ngoId = ngoId;
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
}

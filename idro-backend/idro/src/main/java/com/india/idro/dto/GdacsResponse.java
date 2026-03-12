package com.india.idro.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GdacsResponse {

    private List<GdacsEvent> features;

    public List<GdacsEvent> getFeatures() {
        return features;
    }

    public void setFeatures(List<GdacsEvent> features) {
        this.features = features;
    }
}

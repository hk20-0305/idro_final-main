package com.india.idro.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GdacsEvent {

    // GDACS GeoJSON feature uses "properties" and "geometry" blocks
    private String id;
    private GdacsProperties properties;
    private GdacsGeometry geometry;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public GdacsProperties getProperties() {
        return properties;
    }

    public void setProperties(GdacsProperties properties) {
        this.properties = properties;
    }

    public GdacsGeometry getGeometry() {
        return geometry;
    }

    public void setGeometry(GdacsGeometry geometry) {
        this.geometry = geometry;
    }
}

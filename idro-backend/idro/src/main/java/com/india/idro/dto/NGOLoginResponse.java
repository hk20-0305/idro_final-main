package com.india.idro.dto;

import com.india.idro.model.NGO;

public class NGOLoginResponse {
    private boolean success;
    private String message;
    private NGO ngoProfile;

    public NGOLoginResponse() {}

    public NGOLoginResponse(boolean success, String message, NGO ngoProfile) {
        this.success = success;
        this.message = message;
        this.ngoProfile = ngoProfile;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NGO getNgoProfile() {
        return ngoProfile;
    }

    public void setNgoProfile(NGO ngoProfile) {
        this.ngoProfile = ngoProfile;
    }
}

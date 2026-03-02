package com.india.idro.dto;

public class NGOLoginRequest {
    private String ngoId;
    private String password;

    public NGOLoginRequest() {}

    public NGOLoginRequest(String ngoId, String password) {
        this.ngoId = ngoId;
        this.password = password;
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
}

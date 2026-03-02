package com.india.idro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private boolean success;

    private String message;

    private UserDTO user;

    private String token;  // For future JWT implementation
}
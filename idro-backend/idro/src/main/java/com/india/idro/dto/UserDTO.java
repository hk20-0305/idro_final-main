package com.india.idro.dto;

import com.india.idro.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private String id;

    private String name;

    private String email;

    private UserRole role;

    private LocalDateTime createdAt;

    // Note: Password is NOT included in DTO for security
}
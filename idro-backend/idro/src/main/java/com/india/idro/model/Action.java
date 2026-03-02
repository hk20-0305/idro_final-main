package com.india.idro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "actions")
public class Action {

    @Id
    private String id;
    private String alertId;

    // ✅ ADDED THIS TO FIX 'findByUserId' ERROR
    private String userId; 

    private String description;
    private String status; 
    private LocalDateTime timestamp;

    private String priority;   // Stores "HIGH", "MEDIUM", "LOW"
    private String role;       // Stores "GOV", "NGO", etc.
    private String targetZone; 
    private String resourceType; 
    private int quantity;      

    // --- GETTERS AND SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAlertId() { return alertId; }
    public void setAlertId(String alertId) { this.alertId = alertId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTargetZone() { return targetZone; }
    public void setTargetZone(String targetZone) { this.targetZone = targetZone; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
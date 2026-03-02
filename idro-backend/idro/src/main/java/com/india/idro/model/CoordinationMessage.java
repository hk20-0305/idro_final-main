package com.india.idro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coordination_messages")
public class CoordinationMessage {

    @Id
    private String id;

    private String user;             // e.g., "Gov Command", "NGO HelpIndia"
    private String message;          // The actual message content
    private String type;             // "normal" or "warning"
    private String time;             // e.g., "10:00 AM"

    @CreatedDate
    private LocalDateTime createdAt;
}
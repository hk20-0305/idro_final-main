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

    private String user;
    private String message;
    private String type;
    private String time;

    @CreatedDate
    private LocalDateTime createdAt;
}
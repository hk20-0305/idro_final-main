package com.india.idro.repository;

import com.india.idro.model.Alert;
import com.india.idro.model.enums.AlertColor;
import com.india.idro.model.enums.AlertType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// ✅ EXTENDS MongoRepository<Alert, String> -> This is the CRITICAL part for MongoDB
@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {

    // --- Custom Queries (Spring Data Auto-Implements These) ---

    // Find alerts by type (e.g., EARTHQUAKE, FLOOD)
    List<Alert> findByType(AlertType type);

    // Find alerts by color (e.g., RED, ORANGE)
    List<Alert> findByColor(AlertColor color);

    // Find alerts by location (e.g., "Himachal Pradesh")
    List<Alert> findByLocation(String location);

    // Find alerts by location containing keyword (case-insensitive)
    List<Alert> findByLocationContainingIgnoreCase(String keyword);

    // Find all alerts ordered by creation date (newest first)
    List<Alert> findAllByOrderByCreatedAtDesc();

    // Find alerts by type and color
    List<Alert> findByTypeAndColor(AlertType type, AlertColor color);
}
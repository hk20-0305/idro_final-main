package com.india.idro.repository;

import com.india.idro.model.Alert;
import com.india.idro.model.enums.AlertColor;
import com.india.idro.model.enums.AlertType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {

    List<Alert> findByType(AlertType type);

    List<Alert> findByColor(AlertColor color);

    List<Alert> findByLocation(String location);

    List<Alert> findByLocationContainingIgnoreCase(String keyword);

    List<Alert> findAllByOrderByCreatedAtDesc();

    List<Alert> findByTypeAndColor(AlertType type, AlertColor color);
}
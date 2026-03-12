package com.india.idro.repository;

import com.india.idro.model.Camp;
import com.india.idro.model.enums.CampStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampRepository extends MongoRepository<Camp, String> {

    List<Camp> findByAlertId(String alertId);

    List<Camp> findByStatus(CampStatus status);

    List<Camp> findByNameContainingIgnoreCase(String keyword);

    List<Camp> findByUrgencyScoreGreaterThanEqual(Integer threshold);

    List<Camp> findByStatusOrderByUrgencyScoreDesc(CampStatus status);

    List<Camp> findAllByOrderByUrgencyScoreDesc();

    List<Camp> findByPopulationGreaterThan(Integer population);

    default List<Camp> findCriticalCamps() {
        return findByUrgencyScoreGreaterThanEqual(80);
    }
}
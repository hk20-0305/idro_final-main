package com.india.idro.repository;

import com.india.idro.model.Camp;
import com.india.idro.model.enums.CampStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampRepository extends MongoRepository<Camp, String> {

    

    List<Camp> findByAlertId(String alertId);


    // Find camps by status (CRITICAL, STABLE, MODERATE)
    List<Camp> findByStatus(CampStatus status);

    // Find camps by name containing keyword
    List<Camp> findByNameContainingIgnoreCase(String keyword);

    // Find camps where urgency score is greater than or equal to threshold
    List<Camp> findByUrgencyScoreGreaterThanEqual(Integer threshold);

    // Find camps by status ordered by urgency score (highest first)
    List<Camp> findByStatusOrderByUrgencyScoreDesc(CampStatus status);

    // Find all camps ordered by urgency score descending
    List<Camp> findAllByOrderByUrgencyScoreDesc();

    // Find camps where population is greater than given number
    List<Camp> findByPopulationGreaterThan(Integer population);

    // Find critical camps (urgency score >= 80)
    default List<Camp> findCriticalCamps() {
        return findByUrgencyScoreGreaterThanEqual(80);
    }
}
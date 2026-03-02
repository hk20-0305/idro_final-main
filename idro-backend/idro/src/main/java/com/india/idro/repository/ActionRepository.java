package com.india.idro.repository;

import com.india.idro.model.Action;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActionRepository extends MongoRepository<Action, String> {

    // Find by role (VOLUNTEER, NGO, GOV)
    List<Action> findByRole(String role);

    // Find actions by target zone
    List<Action> findByTargetZone(String targetZone);

    // Search by zone keyword
    List<Action> findByTargetZoneContainingIgnoreCase(String keyword);

    // Priority-based (HIGH / LOW)
    List<Action> findByPriority(String priority);

    // Filter by role + priority
    List<Action> findByRoleAndPriority(String role, String priority);

    // Latest actions first
    List<Action> findAllByOrderByTimestampDesc();

    // Actions after specific time
    List<Action> findByTimestampAfter(LocalDateTime timestamp);

    // Actions created by a specific user
    List<Action> findByUserId(String userId);

    // All actions related to a disaster
    List<Action> findByAlertId(String alertId);

    // Smart query: High priority in last 24h
    default List<Action> findRecentPriorityActions() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        return findByTimestampAfter(yesterday)
                .stream()
                .filter(a -> "HIGH".equalsIgnoreCase(a.getPriority()))
                .toList();
    }
}

package com.india.idro.repository;

import com.india.idro.model.Action;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActionRepository extends MongoRepository<Action, String> {

    List<Action> findByRole(String role);

    List<Action> findByTargetZone(String targetZone);

    List<Action> findByTargetZoneContainingIgnoreCase(String keyword);

    List<Action> findByPriority(String priority);

    List<Action> findByRoleAndPriority(String role, String priority);

    List<Action> findAllByOrderByTimestampDesc();

    List<Action> findByTimestampAfter(LocalDateTime timestamp);

    List<Action> findByUserId(String userId);

    List<Action> findByAlertId(String alertId);

    default List<Action> findRecentPriorityActions() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        return findByTimestampAfter(yesterday)
                .stream()
                .filter(a -> "HIGH".equalsIgnoreCase(a.getPriority()))
                .toList();
    }
}

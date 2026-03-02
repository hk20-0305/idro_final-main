package com.india.idro.service;

import com.india.idro.model.Action;
import com.india.idro.model.enums.UserRole;
import com.india.idro.repository.ActionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActionService {

    @Autowired
    private ActionRepository actionRepository;

    // 1. Create Action
    public Action createAction(Action action) {
        action.setTimestamp(LocalDateTime.now());
        // Default logic if missing
        if (action.getStatus() == null) action.setStatus("PENDING");
        return actionRepository.save(action);
    }

    // 2. Get Actions by Role (Fix: Convert Enum to String)
    public List<Action> getActionsByRole(UserRole role) {
        return actionRepository.findByRole(role.toString()); 
    }

    // 3. Get Actions by Target Zone
    public List<Action> getActionsByTargetZone(String zone) {
        return actionRepository.findByTargetZone(zone);
    }

    // 4. Get High Priority Actions (Fix: Use "HIGH" string instead of boolean)
    public List<Action> getHighPriorityActions() {
        return actionRepository.findByPriority("HIGH");
    }

    // 5. Get Actions by Role & Priority (Fix: Convert Enum & Boolean to String)
    public List<Action> getActionsByRoleAndPriority(UserRole role, Boolean isHighPriority) {
        String priorityStr = isHighPriority ? "HIGH" : "LOW";
        return actionRepository.findByRoleAndPriority(role.toString(), priorityStr);
    }

    // 6. Get Recent Actions
    public List<Action> getRecentActions() {
        return actionRepository.findAllByOrderByTimestampDesc();
    }
}
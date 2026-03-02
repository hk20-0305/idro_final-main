package com.india.idro.controller;

import com.india.idro.model.Action;
import com.india.idro.repository.ActionRepository;
import com.india.idro.repository.AlertRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/actions")
@CrossOrigin(origins = "*")
public class ActionController {

    @Autowired
    private ActionRepository actionRepository;

    @Autowired
    private AlertRepository alertRepository; // ✅ FIXED: Now properly injected

    // GET all actions
    @GetMapping
    public List<Action> getAllActions() {
        return actionRepository.findAll();
    }

    // POST create action linked to an alert
    @PostMapping("/{alertId}")
    public ResponseEntity<Action> createAction(
            @PathVariable String alertId,
            @RequestBody Action action) {
        return alertRepository.findById(alertId)
                .map(alert -> {
                    action.setAlertId(alertId);
                    action.setTimestamp(LocalDateTime.now());

                    // Optional safety defaults
                    if (action.getStatus() == null) {
                        action.setStatus("PENDING");
                    }
                    if (action.getPriority() == null) {
                        action.setPriority("LOW");
                    }

                    Action saved = actionRepository.save(action);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

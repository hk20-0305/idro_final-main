package com.india.idro.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.india.idro.model.Alert;
import com.india.idro.repository.AlertRepository;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @GetMapping
    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    @GetMapping("/{id}")
    public Alert getAlertById(@PathVariable String id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
    }

    @PostMapping
    public Alert createAlert(@RequestBody Alert alert) {
        if (alert.getMissionStatus() == null) {
            alert.setMissionStatus("OPEN");
        }
        return alertRepository.save(alert);
    }

    @PutMapping("/{id}")
    public Alert updateAlert(@PathVariable String id, @RequestBody Alert alert) {
        return alertRepository.findById(id).map(existingAlert -> {
            existingAlert.setType(alert.getType());
            existingAlert.setColor(alert.getColor());
            existingAlert.setLocation(alert.getLocation());
            existingAlert.setLatitude(alert.getLatitude());
            existingAlert.setLongitude(alert.getLongitude());
            existingAlert.setMagnitude(alert.getMagnitude());
            existingAlert.setImpact(alert.getImpact());
            existingAlert.setDetails(alert.getDetails());
            existingAlert.setTime(alert.getTime());
            existingAlert.setMissionStatus(alert.getMissionStatus());
            existingAlert.setTrustScore(alert.getTrustScore());
            existingAlert.setReporterLevel(alert.getReporterLevel());
            existingAlert.setSourceType(alert.getSourceType());
            existingAlert.setAffectedCount(alert.getAffectedCount());
            existingAlert.setInjuredCount(alert.getInjuredCount());
            existingAlert.setResponderName(alert.getResponderName());
            existingAlert.setUrgency(alert.getUrgency());
            return alertRepository.save(existingAlert);
        }).orElseThrow(() -> new RuntimeException("Alert not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteAlert(@PathVariable String id) {
        if (!alertRepository.existsById(id)) {
            throw new RuntimeException("Alert not found");
        }
        alertRepository.deleteById(id);
    }

    @PutMapping("/{id}/assign")
    public Alert assignMission(@PathVariable String id, @RequestParam String responderName) {
        return alertRepository.findById(id).map(alert -> {
            if (!"OPEN".equals(alert.getMissionStatus()) && alert.getMissionStatus() != null) {
                throw new RuntimeException("Mission already taken by " + alert.getResponderName());
            }

            alert.setMissionStatus("ASSIGNED");
            alert.setResponderName(responderName);
            return alertRepository.save(alert);
        }).orElseThrow(() -> new RuntimeException("Alert not found"));
    }
}
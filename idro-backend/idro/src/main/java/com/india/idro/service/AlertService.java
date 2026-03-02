package com.india.idro.service;

import com.india.idro.model.Alert;
import com.india.idro.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Alert saveAlert(Alert alert) {
        return alertRepository.save(alert);
    }

   
    public void deleteAlert(String id) {
        alertRepository.deleteById(id);
    }
}
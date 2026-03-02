package com.india.idro.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.india.idro.exception.ResourceNotFoundException;
import com.india.idro.model.Camp;
import com.india.idro.model.Stock;
import com.india.idro.model.enums.CampStatus;
import com.india.idro.repository.CampRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CampService {

    private final CampRepository campRepository;

    // Create new camp
    public Camp createCamp(Camp camp) {
        // Validation: Injured count cannot exceed population
        if (camp.getPopulation() != null) {
            if (camp.getInjuredCount() > camp.getPopulation()) {
                throw new IllegalArgumentException("Injured count cannot exceed current population");
            }
        }
        return campRepository.save(camp);
    }

    // Get all camps
    public List<Camp> getAllCamps() {
        return campRepository.findAllByOrderByUrgencyScoreDesc();
    }

    // Get camp by ID
    public Optional<Camp> getCampById(String id) {
        return campRepository.findById(id);
    }

    // Get camp by ID or throw exception
    public Camp getCampByIdOrThrow(String id) {
        return campRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camp", "id", id));
    }

    // Get camps by status
    public List<Camp> getCampsByStatus(CampStatus status) {
        return campRepository.findByStatus(status);
    }

    // Get critical camps (urgency >= 80)
    public List<Camp> getCriticalCamps() {
        return campRepository.findCriticalCamps();
    }

    // Search camps by name
    public List<Camp> searchCampsByName(String keyword) {
        return campRepository.findByNameContainingIgnoreCase(keyword);
    }

    // Get camps by urgency threshold
    public List<Camp> getCampsByUrgencyThreshold(Integer threshold) {
        return campRepository.findByUrgencyScoreGreaterThanEqual(threshold);
    }

    // Update camp
    public Camp updateCamp(String id, Camp updatedCamp) {
        // Validation: Injured count cannot exceed population
        if (updatedCamp.getPopulation() != null) {
            if (updatedCamp.getInjuredCount() > updatedCamp.getPopulation()) {
                throw new IllegalArgumentException("Injured count cannot exceed current population");
            }
        }

        return campRepository.findById(id)
                .map(existingCamp -> {
                    existingCamp.setName(updatedCamp.getName());
                    existingCamp.setStatus(updatedCamp.getStatus());
                    existingCamp.setUrgencyScore(updatedCamp.getUrgencyScore());
                    existingCamp.setPopulation(updatedCamp.getPopulation());
                    existingCamp.setInjuredCount(updatedCamp.getInjuredCount());
                    existingCamp.setMedicinesNeeded(updatedCamp.isMedicinesNeeded());
                    existingCamp.setStock(updatedCamp.getStock());
                    existingCamp.setIncomingAid(updatedCamp.getIncomingAid());
                    existingCamp.setImage(updatedCamp.getImage());
                    existingCamp.setLatitude(updatedCamp.getLatitude());
                    existingCamp.setLongitude(updatedCamp.getLongitude());
                    return campRepository.save(existingCamp);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Camp", "id", id));
    }

    // Update camp status only
    public Camp updateCampStatus(String id, CampStatus status) {
        return campRepository.findById(id)
                .map(camp -> {
                    camp.setStatus(status);
                    return campRepository.save(camp);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Camp", "id", id));
    }

    // Update camp stock
    public Camp updateCampStock(String id, Stock stock) {
        return campRepository.findById(id)
                .map(camp -> {
                    camp.setStock(stock);
                    return campRepository.save(camp);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Camp", "id", id));
    }

    // Update camp population
    public Camp updateCampPopulation(String id, Integer population) {
        return campRepository.findById(id)
                .map(camp -> {
                    camp.setPopulation(population);
                    return campRepository.save(camp);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Camp", "id", id));
    }

    // Delete camp
    public void deleteCamp(String id) {
        campRepository.deleteById(id);
    }

    // Get total count of camps
    public long getCampCount() {
        return campRepository.count();
    }

    // Get count of critical camps
    public long getCriticalCampCount() {
        return campRepository.findCriticalCamps().size();
    }
}
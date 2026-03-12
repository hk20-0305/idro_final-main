package com.india.idro.controller;

import com.india.idro.model.Camp;
import com.india.idro.model.Stock;
import com.india.idro.model.enums.CampStatus;
import com.india.idro.repository.CampRepository;
import com.india.idro.service.CampService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/camps")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CampController {

    private final CampService campService;
    private final CampRepository campRepository;

    @GetMapping
    public ResponseEntity<List<Camp>> getAllCamps() {
        return ResponseEntity.ok(campService.getAllCamps());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Camp> getCampById(@PathVariable String id) {
        return campService.getCampById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Camp>> getCampsByStatus(@PathVariable CampStatus status) {
        return ResponseEntity.ok(campService.getCampsByStatus(status));
    }

    @GetMapping("/critical")
    public ResponseEntity<List<Camp>> getCriticalCamps() {
        return ResponseEntity.ok(campService.getCriticalCamps());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Camp>> searchCamps(@RequestParam String keyword) {
        return ResponseEntity.ok(campService.searchCampsByName(keyword));
    }

    @GetMapping("/urgency/{threshold}")
    public ResponseEntity<List<Camp>> getCampsByUrgency(@PathVariable Integer threshold) {
        return ResponseEntity.ok(campService.getCampsByUrgencyThreshold(threshold));
    }

    @PostMapping
    public ResponseEntity<?> createCamp(@RequestBody Camp camp) {
        try {
            Camp createdCamp = campService.createCamp(camp);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCamp);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Camp creation failed: " + e.getMessage());
        }
    }

    @GetMapping("/by-alert/{alertId}")
    public ResponseEntity<List<Camp>> getCampsByAlert(@PathVariable String alertId) {
        return ResponseEntity.ok(campRepository.findByAlertId(alertId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Camp> updateCamp(@PathVariable String id, @RequestBody Camp camp) {
        try {
            return ResponseEntity.ok(campService.updateCamp(id, camp));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Camp> updateCampStatus(@PathVariable String id, @RequestBody CampStatus status) {
        try {
            return ResponseEntity.ok(campService.updateCampStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Camp> updateCampStock(@PathVariable String id, @RequestBody Stock stock) {
        try {
            return ResponseEntity.ok(campService.updateCampStock(id, stock));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/population")
    public ResponseEntity<Camp> updateCampPopulation(@PathVariable String id, @RequestBody Integer population) {
        try {
            return ResponseEntity.ok(campService.updateCampPopulation(id, population));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCamp(@PathVariable String id) {
        campService.deleteCamp(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getCampCount() {
        return ResponseEntity.ok(campService.getCampCount());
    }

    @GetMapping("/count/critical")
    public ResponseEntity<Long> getCriticalCampCount() {
        return ResponseEntity.ok(campService.getCriticalCampCount());
    }
}

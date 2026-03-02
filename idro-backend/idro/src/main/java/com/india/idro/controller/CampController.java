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

    // GET /api/camps
    @GetMapping
    public ResponseEntity<List<Camp>> getAllCamps() {
        return ResponseEntity.ok(campService.getAllCamps());
    }

    // GET /api/camps/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Camp> getCampById(@PathVariable String id) {
        return campService.getCampById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/camps/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Camp>> getCampsByStatus(@PathVariable CampStatus status) {
        return ResponseEntity.ok(campService.getCampsByStatus(status));
    }

    // GET /api/camps/critical
    @GetMapping("/critical")
    public ResponseEntity<List<Camp>> getCriticalCamps() {
        return ResponseEntity.ok(campService.getCriticalCamps());
    }

    // GET /api/camps/search?keyword=kerala
    @GetMapping("/search")
    public ResponseEntity<List<Camp>> searchCamps(@RequestParam String keyword) {
        return ResponseEntity.ok(campService.searchCampsByName(keyword));
    }

    // GET /api/camps/urgency/{threshold}
    @GetMapping("/urgency/{threshold}")
    public ResponseEntity<List<Camp>> getCampsByUrgency(@PathVariable Integer threshold) {
        return ResponseEntity.ok(campService.getCampsByUrgencyThreshold(threshold));
    }

    // POST /api/camps  (FIXED WITH SAFE ERROR HANDLING)
    @PostMapping
    public ResponseEntity<?> createCamp(@RequestBody Camp camp) {
        try {
            Camp createdCamp = campService.createCamp(camp);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCamp);
        } catch (Exception e) {
            e.printStackTrace(); // You will now see exact error in backend console
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Camp creation failed: " + e.getMessage());
        }
    }

    // GET /api/camps/by-alert/{alertId}
    @GetMapping("/by-alert/{alertId}")
    public ResponseEntity<List<Camp>> getCampsByAlert(@PathVariable String alertId) {
        return ResponseEntity.ok(campRepository.findByAlertId(alertId));
    }

    // PUT /api/camps/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Camp> updateCamp(@PathVariable String id, @RequestBody Camp camp) {
        try {
            return ResponseEntity.ok(campService.updateCamp(id, camp));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH /api/camps/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Camp> updateCampStatus(@PathVariable String id, @RequestBody CampStatus status) {
        try {
            return ResponseEntity.ok(campService.updateCampStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH /api/camps/{id}/stock
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Camp> updateCampStock(@PathVariable String id, @RequestBody Stock stock) {
        try {
            return ResponseEntity.ok(campService.updateCampStock(id, stock));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH /api/camps/{id}/population
    @PatchMapping("/{id}/population")
    public ResponseEntity<Camp> updateCampPopulation(@PathVariable String id, @RequestBody Integer population) {
        try {
            return ResponseEntity.ok(campService.updateCampPopulation(id, population));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/camps/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCamp(@PathVariable String id) {
        campService.deleteCamp(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/camps/count
    @GetMapping("/count")
    public ResponseEntity<Long> getCampCount() {
        return ResponseEntity.ok(campService.getCampCount());
    }

    // GET /api/camps/count/critical
    @GetMapping("/count/critical")
    public ResponseEntity<Long> getCriticalCampCount() {
        return ResponseEntity.ok(campService.getCriticalCampCount());
    }
}

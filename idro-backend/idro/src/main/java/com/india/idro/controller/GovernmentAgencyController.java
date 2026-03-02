package com.india.idro.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.india.idro.model.GovernmentAgency;
import com.india.idro.model.ResourceItem;
import com.india.idro.model.enums.AvailabilityStatus;
import com.india.idro.model.enums.CoverageRadius;
import com.india.idro.model.enums.ResponseTime;
import com.india.idro.service.GovernmentAgencyService;

@RestController
@RequestMapping("/api/government")
@CrossOrigin(origins = "*")
public class GovernmentAgencyController {

    @Autowired
    private GovernmentAgencyService agencyService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String agencyId = loginRequest.get("agencyId");
        String password = loginRequest.get("password");

        System.out.println("🔐 Government Agency Login Attempt: " + agencyId);

        GovernmentAgency agency = agencyService.getAgencyByAgencyId(agencyId);

        if (agency != null && password != null && password.equals(agency.getPassword())) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login successful",
                    "agency", agency));
        } else {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid Agency ID or Password"));
        }
    }

    @GetMapping("/{agencyId}")
    public ResponseEntity<?> getAgencyProfile(@PathVariable String agencyId) {
        GovernmentAgency agency = agencyService.getAgencyByAgencyId(agencyId);

        if (agency != null) {
            return ResponseEntity.ok(agency);
        } else {
            return ResponseEntity.status(404).body("Agency not found");
        }
    }

    @PutMapping("/{agencyId}/availability")
    public ResponseEntity<?> updateAvailability(
            @PathVariable String agencyId,
            @RequestBody Map<String, String> request) {

        System.out.println("🟢 Updating availability for Agency: " + agencyId);

        AvailabilityStatus status = request.get("availabilityStatus") != null
                ? AvailabilityStatus.valueOf(request.get("availabilityStatus"))
                : null;

        ResponseTime responseTime = request.get("responseTime") != null
                ? ResponseTime.valueOf(request.get("responseTime"))
                : null;

        CoverageRadius coverageRadius = request.get("coverageRadius") != null
                ? CoverageRadius.valueOf(request.get("coverageRadius"))
                : null;

        GovernmentAgency updatedAgency = agencyService.updateAvailability(
                agencyId, status, responseTime, coverageRadius);

        if (updatedAgency != null) {
            return ResponseEntity.ok(updatedAgency);
        } else {
            return ResponseEntity.status(404).body("Agency not found");
        }
    }

    @PutMapping("/{agencyId}/resources")
    public ResponseEntity<?> updateResources(
            @PathVariable String agencyId,
            @RequestBody Map<String, List<ResourceItem>> resources) {

        System.out.println("📦 Updating resources for Agency: " + agencyId);

        GovernmentAgency updatedAgency = agencyService.updateResources(agencyId, resources);

        if (updatedAgency != null) {
            return ResponseEntity.ok(updatedAgency);
        } else {
            return ResponseEntity.status(404).body("Agency not found");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<GovernmentAgency>> getAllAgencies(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String disasterId) {
        System.out.println(
                "📋 Fetching Government Agencies for context: " + (disasterId != null ? disasterId : "GLOBAL"));
        List<GovernmentAgency> agencies = agencyService.getAllAgencies(disasterId);
        return ResponseEntity.ok(agencies);
    }

    @GetMapping("/init")
    public ResponseEntity<String> initialize() {
        System.out.println("🛠️ Manual Government Agency Initialization Triggered");
        agencyService.initializeDemoAgencies();
        return ResponseEntity
                .ok("Government Agency Demo accounts initialization triggered. Check console for details.");
    }
}

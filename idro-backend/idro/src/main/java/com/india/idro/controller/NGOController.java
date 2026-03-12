package com.india.idro.controller;

import java.util.List;

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

import com.india.idro.dto.AvailabilityUpdateRequest;
import com.india.idro.dto.NGOLoginRequest;
import com.india.idro.dto.NGOLoginResponse;
import com.india.idro.dto.ResourceUpdateRequest;
import com.india.idro.model.NGO;
import com.india.idro.service.NGOService;

@RestController
@RequestMapping("/api/ngo")
@CrossOrigin(origins = "*")
public class NGOController {

    @Autowired
    private NGOService ngoService;

    @PostMapping("/login")
    public ResponseEntity<NGOLoginResponse> login(@RequestBody NGOLoginRequest request) {
        NGO ngo = ngoService.authenticateNGO(request.getNgoId(), request.getPassword());

        if (ngo != null) {
            ngo.setPassword(null);

            NGOLoginResponse response = new NGOLoginResponse(
                    true,
                    "Login successful",
                    ngo);
            return ResponseEntity.ok(response);
        } else {
            NGOLoginResponse response = new NGOLoginResponse(
                    false,
                    "Invalid NGO ID or Password",
                    null);
            return ResponseEntity.status(401).body(response);
        }
    }

    @GetMapping("/profile/{ngoId}")
    public ResponseEntity<?> getProfile(@PathVariable String ngoId) {
        NGO ngo = ngoService.getNGOProfile(ngoId);

        if (ngo != null) {
            ngo.setPassword(null);
            return ResponseEntity.ok(ngo);
        } else {
            return ResponseEntity.status(404).body("NGO not found");
        }
    }

    @PutMapping("/resources")
    public ResponseEntity<?> updateResources(@RequestBody ResourceUpdateRequest request) {
        NGO updatedNGO = ngoService.updateResources(
                request.getNgoId(),
                request.getReliefSupplies(),
                request.getMedicalSupport(),
                request.getShelterEssentials(),
                request.getHumanResources(),
                request.getAdditionalNotes());

        if (updatedNGO != null) {
            updatedNGO.setPassword(null);
            return ResponseEntity.ok(updatedNGO);
        } else {
            return ResponseEntity.status(404).body("NGO not found");
        }
    }

    @PutMapping("/availability")
    public ResponseEntity<?> updateAvailability(@RequestBody AvailabilityUpdateRequest request) {
        NGO updatedNGO = ngoService.updateAvailability(
                request.getNgoId(),
                request.getAvailabilityStatus(),
                request.getResponseTime(),
                request.getCoverageRadius());

        if (updatedNGO != null) {
            updatedNGO.setPassword(null);
            return ResponseEntity.ok(updatedNGO);
        } else {
            return ResponseEntity.status(404).body("NGO not found");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<NGO>> getAllNGOs(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String disasterId) {
        List<NGO> ngos = ngoService.getAllNGOs(disasterId);
        ngos.forEach(ngo -> ngo.setPassword(null));
        return ResponseEntity.ok(ngos);
    }

    @GetMapping("/init")
    public ResponseEntity<String> initialize() {
        ngoService.initializeDemoAccounts();
        return ResponseEntity.ok("NGO Demo accounts initialization triggered. Check console for details.");
    }
}

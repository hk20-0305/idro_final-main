package com.india.idro.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.india.idro.model.Volunteer;
import com.india.idro.service.VolunteerService;

@RestController
@RequestMapping("/api/volunteer")
@CrossOrigin(origins = "*")
public class VolunteerController {

    @Autowired
    private VolunteerService volunteerService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String volunteerId = loginRequest.get("volunteerId");
        String password = loginRequest.get("password");

        System.out.println("🔐 Volunteer Login Attempt: " + volunteerId);
        System.out.println("📝 Received password: " + password);

        Volunteer volunteer = volunteerService.getVolunteerByVolunteerId(volunteerId);

        if (volunteer == null) {
            System.out.println("❌ Volunteer not found: " + volunteerId);
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid Volunteer ID or Password"));
        }

        System.out.println("✅ Volunteer found: " + volunteer.getName());
        System.out.println("🔑 Stored password: " + volunteer.getPassword());
        System.out.println("🔍 Password match: " + password.equals(volunteer.getPassword()));

        if (password != null && password.equals(volunteer.getPassword())) {
            System.out.println("✅ Login successful for: " + volunteerId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login successful",
                    "volunteer", volunteer));
        } else {
            System.out.println("❌ Password mismatch for: " + volunteerId);
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid Volunteer ID or Password"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllVolunteers() {
        List<Volunteer> volunteers = volunteerService.getAllVolunteers();
        return ResponseEntity.ok(volunteers);
    }

    @GetMapping("/{volunteerId}")
    public ResponseEntity<?> getVolunteerProfile(@PathVariable String volunteerId) {
        Volunteer volunteer = volunteerService.getVolunteerByVolunteerId(volunteerId);

        if (volunteer != null) {
            return ResponseEntity.ok(volunteer);
        } else {
            return ResponseEntity.status(404).body("Volunteer not found");
        }
    }
}

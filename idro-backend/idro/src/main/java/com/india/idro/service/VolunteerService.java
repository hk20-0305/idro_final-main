package com.india.idro.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.india.idro.model.Volunteer;
import com.india.idro.repository.VolunteerRepository;

import jakarta.annotation.PostConstruct;

@Service
public class VolunteerService {

    @Autowired
    private VolunteerRepository volunteerRepository;

    @PostConstruct
    public void initializeDemoVolunteers() {
        // Check if demo volunteers already exist
        if (volunteerRepository.count() > 0) {
            System.out.println("✅ Volunteer demo accounts already initialized");
            return;
        }

        System.out.println("🔧 Initializing 5 Volunteer demo accounts...");

        // Create 5 pre-defined volunteer accounts
        List<Volunteer> demoVolunteers = Arrays.asList(
                createDemoVolunteer("V001", "1234", "Raj Kumar", "+91-98765-43210", "raj.kumar@email.com", "Mumbai",
                        "First Aid, Rescue"),
                createDemoVolunteer("V002", "1234", "Priya Sharma", "+91-98765-43211", "priya.sharma@email.com", "Delhi",
                        "Medical Support, Counseling"),
                createDemoVolunteer("V003", "1234", "Amit Patel", "+91-98765-43212", "amit.patel@email.com", "Bangalore",
                        "Logistics, Distribution"),
                createDemoVolunteer("V004", "1234", "Sneha Reddy", "+91-98765-43213", "sneha.reddy@email.com", "Chennai",
                        "Communication, Coordination"),
                createDemoVolunteer("V005", "1234", "Vikram Singh", "+91-98765-43214", "vikram.singh@email.com",
                        "Kolkata", "Technical Support, IT"));

        volunteerRepository.saveAll(demoVolunteers);
        System.out.println("✅ Successfully initialized " + demoVolunteers.size() + " volunteer demo accounts");
    }

    private Volunteer createDemoVolunteer(String volunteerId, String password, String name,
            String mobileNumber, String email, String location, String skills) {
        Volunteer volunteer = new Volunteer();
        volunteer.setVolunteerId(volunteerId);
        volunteer.setPassword(password);
        volunteer.setName(name);
        volunteer.setMobileNumber(mobileNumber);
        volunteer.setEmail(email);
        volunteer.setLocation(location);
        volunteer.setSkills(skills);
        volunteer.setAvailable(true);
        return volunteer;
    }

    public Volunteer getVolunteerByVolunteerId(String volunteerId) {
        Optional<Volunteer> volunteer = volunteerRepository.findByVolunteerId(volunteerId);
        return volunteer.orElse(null);
    }

    public List<Volunteer> getAllVolunteers() {
        return volunteerRepository.findAll();
    }

    public Volunteer updateVolunteer(Volunteer volunteer) {
        return volunteerRepository.save(volunteer);
    }
}

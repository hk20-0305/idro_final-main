package com.india.idro.controller;
import com.india.idro.model.Camp;
import com.india.idro.repository.CampRepository;

import java.util.List;

import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/mission")
@CrossOrigin
public class MissionController {

    private final CampRepository campRepository;

    public MissionController(CampRepository campRepository) {
        this.campRepository = campRepository;
    }

    // This will power your Mission Control page
    @GetMapping("/camps")
    public List<Camp> getAllVolunteerCamps() {
        return campRepository.findAll();
    }
}

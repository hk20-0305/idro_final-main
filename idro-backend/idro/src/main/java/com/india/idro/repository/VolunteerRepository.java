package com.india.idro.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.india.idro.model.Volunteer;

@Repository
public interface VolunteerRepository extends MongoRepository<Volunteer, String> {

    Optional<Volunteer> findByVolunteerId(String volunteerId);
}

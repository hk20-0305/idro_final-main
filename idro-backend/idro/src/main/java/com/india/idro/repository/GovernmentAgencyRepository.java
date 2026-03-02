package com.india.idro.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.india.idro.model.GovernmentAgency;

@Repository
public interface GovernmentAgencyRepository extends MongoRepository<GovernmentAgency, String> {

    Optional<GovernmentAgency> findByAgencyId(String agencyId);

    java.util.List<GovernmentAgency> findByOperatingRegionIgnoreCase(String region);
}

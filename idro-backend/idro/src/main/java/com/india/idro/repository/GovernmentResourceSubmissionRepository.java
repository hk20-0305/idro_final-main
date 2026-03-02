package com.india.idro.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.india.idro.model.GovernmentResourceSubmission;

@Repository
public interface GovernmentResourceSubmissionRepository extends MongoRepository<GovernmentResourceSubmission, String> {
    List<GovernmentResourceSubmission> findByAgencyId(String agencyId);
}

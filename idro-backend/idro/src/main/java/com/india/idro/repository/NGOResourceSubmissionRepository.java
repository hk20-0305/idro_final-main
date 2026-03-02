package com.india.idro.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.india.idro.model.NGOResourceSubmission;

@Repository
public interface NGOResourceSubmissionRepository extends MongoRepository<NGOResourceSubmission, String> {
    List<NGOResourceSubmission> findByNgoId(String ngoId);
}

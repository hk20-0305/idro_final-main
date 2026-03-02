package com.india.idro.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.india.idro.model.NGO;

@Repository
public interface NGORepository extends MongoRepository<NGO, String> {
    Optional<NGO> findByNgoId(String ngoId);

    java.util.List<NGO> findByStateIgnoreCase(String state);

    java.util.List<NGO> findByNgoIdIn(java.util.List<String> ngoIds);
}

package com.india.idro.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.india.idro.model.IntelAlert;

public interface IntelAlertRepository extends MongoRepository<IntelAlert, String> {

    List<IntelAlert> findByCountryOrderByCreatedAtDesc(String country);

    List<IntelAlert> findByCountry(String country);

    List<IntelAlert> findByCountryAndSourceIsNullOrderByCreatedAtDesc(String country);

    List<IntelAlert> findBySourceOrderByCreatedAtDesc(String source);

    boolean existsByExternalId(String externalId);
}

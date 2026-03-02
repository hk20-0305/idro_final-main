package com.india.idro.repository;

import com.india.idro.model.User;
import com.india.idro.model.enums.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // ✅ ADD THIS METHOD
    Optional<User> findByUsername(String username);

    // (Keep your existing methods below)
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    Optional<User> findByName(String name);
    List<User> findByNameContainingIgnoreCase(String keyword);
    List<User> findAllByOrderByCreatedAtDesc();
    long countByRole(UserRole role);
}
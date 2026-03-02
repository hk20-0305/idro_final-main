package com.india.idro.service;

import com.india.idro.model.User;
import com.india.idro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // --- REAL LOGIN LOGIC ---
    public User loginUser(String username, String password, String role) {
        // 1. Find User by Username
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return null; // User not found
        }
        
        User user = userOpt.get();

        // 2. Check Password
        if (!user.getPassword().equals(password)) {
            return null; // Wrong password
        }

        // 3. Check Role (GOV, NGO, VOLUNTEER)
        if (!user.getRole().name().equalsIgnoreCase(role)) {
            return null; // Role mismatch
        }

        return user; // Success
    }
}
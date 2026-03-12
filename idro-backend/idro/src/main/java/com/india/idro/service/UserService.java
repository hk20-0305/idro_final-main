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

    public User loginUser(String username, String password, String role) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return null;
        }
        
        User user = userOpt.get();

        if (!user.getPassword().equals(password)) {
            return null;
        }

        if (!user.getRole().name().equalsIgnoreCase(role)) {
            return null;
        }

        return user;
    }
}
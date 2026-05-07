package com.MCA.authN_Z.service;


import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.MCA.authN_Z.dto.RegisterRequest;
import com.MCA.authN_Z.entity.User;
import com.MCA.authN_Z.exception.ResourceNotFoundException;
import com.MCA.authN_Z.exception.UserAlreadyExistsException;
import com.MCA.authN_Z.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository repo;
    @Autowired
    private BCryptPasswordEncoder encoder;

    public User register(RegisterRequest req) {

        if (repo.existsByUsername(req.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());

        
        user.setPassword(encoder.encode(req.getPassword()));

        user.setRole("USER");
        return repo.save(user);
    }

    public User getUserById(UUID id) {
       return repo.findById(id).orElseThrow(() ->
            new ResourceNotFoundException("User not found"));
    }

    public Iterable<User> getAllUsers() {
        return repo.findAll();
    }

    public User getUserByUsername(String username) {
        return repo.findByUsername(username);
    }
}

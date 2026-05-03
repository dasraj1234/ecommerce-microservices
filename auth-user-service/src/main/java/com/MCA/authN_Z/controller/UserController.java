package com.MCA.authN_Z.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.MCA.authN_Z.dto.RegisterRequest;
import com.MCA.authN_Z.entity.User;
import com.MCA.authN_Z.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private  UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        // Implement registration logic here
        return userService.register(request);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id) {
        // Implement logic to retrieve user by ID here
        return userService.getUserById(id);
    }

    @GetMapping("/all")
    public Iterable<User> getAllUsers() {
        // Implement logic to retrieve all users here
        return userService.getAllUsers();
    }
}

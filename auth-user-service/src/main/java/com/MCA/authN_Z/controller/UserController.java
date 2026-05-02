package com.MCA.authN_Z.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {
    @PostMapping("/register")
    public String register() {
        // Implement registration logic here
        return "Registration successful";
    }

    @GetMapping("/{id}")
    public String getUserById() {
        // Implement logic to retrieve user by ID here
        return "User details";
    }

    @GetMapping("/all")
    public String getAllUsers() {
        // Implement logic to retrieve all users here
        return "List of all users";
    }
}

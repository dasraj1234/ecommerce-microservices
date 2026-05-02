package com.MCA.authN_Z.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @PostMapping("/login")
    public String login() {
        // Implement login logic here
        return "Login successful";
    }
}

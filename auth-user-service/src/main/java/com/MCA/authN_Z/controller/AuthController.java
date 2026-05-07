package com.MCA.authN_Z.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.MCA.authN_Z.dto.LoginRequest;
import com.MCA.authN_Z.dto.LoginResponse;
import com.MCA.authN_Z.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        //System.out.println("Login request received: " + request.getUsername());
        return authService.login(request);
    }
}

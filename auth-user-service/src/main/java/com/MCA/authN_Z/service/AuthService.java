package com.MCA.authN_Z.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.MCA.authN_Z.dto.LoginRequest;
import com.MCA.authN_Z.dto.LoginResponse;
import com.MCA.authN_Z.exception.InvalidCredentialsException;
import com.MCA.authN_Z.utill.JwtUtil;
@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        Authentication authN = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );
        //System.out.println("Authentication result: " + authN.isAuthenticated());
        if (authN.isAuthenticated()) {
            String role = authN.getAuthorities()
                           .stream()
                           .findFirst()
                           .get()
                           .getAuthority();
            String token = jwtUtil.generateToken(request.getUsername(), role);
            return new LoginResponse(
                token,
                request.getUsername(),
                role
            );
        } else {
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }  
}

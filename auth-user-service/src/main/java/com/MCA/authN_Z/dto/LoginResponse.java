package com.MCA.authN_Z.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private String token;
    private String username;
    private String role;
    private String userId;

    public LoginResponse() {}

    public LoginResponse(String token, String username, String role, String userId) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.userId = userId;
    }
}

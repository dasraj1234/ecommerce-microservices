package com.MCA.authN_Z.utill;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;  

@Component
public class JwtUtil {

    private static final String SECRET =
            "mySuperSecretKeyForJwtAuthentication12345";

    private static final long EXPIRATION_TIME = 1000L * 60 * 60 * 24;

    // SecretKey, not Key
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)                              
                .issuedAt(new Date())                           
                .expiration(                                    
                        new Date(System.currentTimeMillis() + EXPIRATION_TIME)
                )
                .signWith(key, Jwts.SIG.HS256)                 
                .compact();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)                               
                .build()
                .parseSignedClaims(token)                      
                .getPayload();                                  
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();        
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());    
    }

    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
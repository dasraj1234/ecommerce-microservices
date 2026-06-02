package com.MCA.authN_Z.entity;

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    // Store the UUID as a readable 36-char string (varchar) instead of binary,
    // so seed data in ecommerce_db.sql can insert plain UUID strings.
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID id;
    private String username;  
    private String password;
    private String email;
    private String role;
    
    private LocalDate createdAt;
}

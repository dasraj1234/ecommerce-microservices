package com.MCA.authN_Z.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.MCA.authN_Z.entity.User;

public interface UserRepository extends JpaRepository<User, UUID>  {
    
}

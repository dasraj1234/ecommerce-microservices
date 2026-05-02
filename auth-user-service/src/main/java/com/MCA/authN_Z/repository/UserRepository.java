package com.MCA.authN_Z.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.MCA.authN_Z.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>  {

    User findByUsername(String username);
}

package com.MCA.authN_Z.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.MCA.authN_Z.service.UserService;

// Runs once at startup and assigns a business userId (USER-1001, ...) to any
// account created before that column existed. No-op once every non-admin
// user has an id.
@Component
public class UserIdBackfillRunner implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) {
        userService.backfillMissingUserIds();
    }
}

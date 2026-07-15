package com.MCA.authN_Z.service;


import java.util.Comparator;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.MCA.authN_Z.dto.RegisterRequest;
import com.MCA.authN_Z.entity.User;
import com.MCA.authN_Z.exception.ResourceNotFoundException;
import com.MCA.authN_Z.exception.UserAlreadyExistsException;
import com.MCA.authN_Z.repository.UserRepository;

@Service
public class UserService {
    private static final String USER_ID_PREFIX = "USER-";
    private static final int USER_ID_START = 1001;

    @Autowired
    private UserRepository repo;
    @Autowired
    private BCryptPasswordEncoder encoder;

    public User register(RegisterRequest req) {

        if (repo.existsByUsername(req.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());


        user.setPassword(encoder.encode(req.getPassword()));

        user.setRole("USER");
        user.setUserId(generateNextUserId());
        return repo.save(user);
    }

    // Next sequential business id (USER-1001, USER-1002, ...). Small user
    // count in this app makes an in-memory max-scan simple and safe enough;
    // a DB sequence would be needed at real scale.
    private synchronized String generateNextUserId() {
        int next = repo.findByUserIdIsNotNull().stream()
                .map(User::getUserId)
                .map(id -> id.substring(USER_ID_PREFIX.length()))
                .filter(suffix -> suffix.chars().allMatch(Character::isDigit))
                .map(Integer::parseInt)
                .max(Comparator.naturalOrder())
                .map(max -> max + 1)
                .orElse(USER_ID_START);
        return USER_ID_PREFIX + next;
    }

    // One-time backfill for accounts created before the userId column existed
    // (e.g. the seeded admin/user1..user8 rows). Assigns ids in `id` order so
    // user1 -> USER-1001, matching the order/payment/wallet seed data that
    // already references USER-1001. Admins are skipped — they never place
    // orders or hold a wallet, so they need no business id.
    public void backfillMissingUserIds() {
        repo.findByUserIdIsNull().stream()
                .filter(u -> !"ADMIN".equalsIgnoreCase(u.getRole()))
                .sorted(Comparator.comparing(u -> u.getId().toString()))
                .forEach(u -> {
                    u.setUserId(generateNextUserId());
                    repo.save(u);
                });
    }

    public User getUserById(UUID id) {
       return repo.findById(id).orElseThrow(() ->
            new ResourceNotFoundException("User not found"));
    }

    public Iterable<User> getAllUsers() {
        return repo.findAll();
    }

    public User getUserByUsername(String username) {
        return repo.findByUsername(username);
    }
}

package com.ecommerce.paymentwallet.wallet.service;

import org.springframework.stereotype.Service;

@Service
public class WalletService {

    public boolean debit(String userId, double amount) {

        // 🔥 TEMP LOGIC (for now)
        if (amount > 1000) {
            return false; // simulate insufficient balance
        }

        System.out.println("Debited: " + amount + " from " + userId);
        return true;
    }

    public void credit(String userId, double amount) {
        System.out.println("Credited: " + amount + " to " + userId);
    }
}
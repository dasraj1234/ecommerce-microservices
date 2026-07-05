//razorpay integration 12th june
package com.ecommerce.paymentwallet.wallet.service;

import org.springframework.stereotype.Service;

@Service
public class WalletService {

    public boolean debit(
            String userId,
            double amount) {

        System.out.println(
            "Wallet stub called for user "
            + userId +
            " amount "
            + amount
        );

        return true;
    }
}
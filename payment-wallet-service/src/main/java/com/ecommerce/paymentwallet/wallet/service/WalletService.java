package com.ecommerce.paymentwallet.wallet.service;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.paymentwallet.common.util.IdGenerator;
import com.ecommerce.paymentwallet.notification.service.NotificationService;
import com.ecommerce.paymentwallet.wallet.dto.WalletResponse;
import com.ecommerce.paymentwallet.wallet.dto.WalletTransactionResponse;
import com.ecommerce.paymentwallet.wallet.repository.WalletRepository;
import java.util.List;

import com.ecommerce.paymentwallet.wallet.dto.WalletResponse;
import com.ecommerce.paymentwallet.wallet.dto.WalletTransactionResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

    private final IdGenerator idGenerator;

    private final NotificationService notificationService;

private final BCryptPasswordEncoder passwordEncoder;
public WalletResponse getWallet(String userId) {

    return walletRepository.getWallet(userId);

}
    //-------------------------------------------------
    // CREATE WALLET
    //-------------------------------------------------

public WalletResponse createWallet(String userId) {

    if (!walletRepository.exists(userId)) {

        String walletId =
                idGenerator.generateWalletId();

        walletRepository.createWallet(
                walletId,
                userId
        );
    }

    return walletRepository.getWallet(userId);
}

    //-------------------------------------------------
    // SET PIN
    //-------------------------------------------------

public String setPin(

        String userId,

        String pin

){

    String encodedPin =
            passwordEncoder.encode(pin);

    walletRepository.updatePin(
            userId,
            encodedPin
    );

    return "Wallet PIN set successfully";
}

    //-------------------------------------------------
    // VERIFY PIN
    //-------------------------------------------------

    public boolean verifyPin(

            String userId,

            String enteredPin

    ){

        // already blocked?

        if("BLOCKED".equalsIgnoreCase(
                walletRepository.getWalletStatus(userId)
        )){

            Timestamp blockedUntil =
                    walletRepository.getBlockedUntil(
                            userId
                    );

            if(blockedUntil!=null &&
                    blockedUntil.toLocalDateTime()
                            .isAfter(LocalDateTime.now())){

                return false;

            }

            walletRepository.unblockWallet(
                    userId
            );
        }

        String encodedPin =
                walletRepository.getEncodedPin(
                        userId
                );

        boolean matched =
                passwordEncoder.matches(
                        enteredPin,
                        encodedPin
                );

        if(matched){

            walletRepository.resetFailedAttempts(
                    userId
            );

            walletRepository.saveSecurityLog(

                    walletRepository.getWalletId(
                            userId
                    ),

                    userId,

                    "PIN_SUCCESS",

                    "Correct wallet pin"

            );

            return true;

        }

        walletRepository.incrementFailedAttempts(
                userId
        );

        Integer attempts =
                walletRepository.getFailedAttempts(
                        userId
                );

        walletRepository.saveSecurityLog(

                walletRepository.getWalletId(
                        userId
                ),

                userId,

                "WRONG_PIN",

                "Wrong wallet pin"

        );

        if(attempts>=4){

            walletRepository.blockWallet(

                    userId,

                    "4 Incorrect PIN attempts"

            );

            walletRepository.saveSecurityLog(

                    walletRepository.getWalletId(
                            userId
                    ),

                    userId,

                    "WALLET_BLOCKED",

                    "Wallet blocked"

            );

            /*
             * Email
             *
             * Replace with actual email lookup later
             */

            notificationService.sendPaymentSuccessMail(

                    "customer@email.com",

                    userId,

                    "BLOCK",

                    0.0

            );

        }

        return false;

    }

    //-------------------------------------------------
    // DEBIT
    //-------------------------------------------------

    public boolean debit(

           String userId,

        String paymentId,

        String orderId,

        double amount

    ){

        Double balance =
                walletRepository.getBalance(
                        userId
                );

        if(balance<amount){

            return false;

        }

        balance-=amount;

        walletRepository.updateBalance(

                userId,

                balance

        );

        walletRepository.saveTransaction(

                idGenerator.generateWalletTransactionId(),

        walletRepository.getWalletId(userId),

        paymentId,

        orderId,

        userId,

        amount,

        "DEBIT",

        "SUCCESS"

        );

        return true;

    }

    //-------------------------------------------------
    // TOP-UP (CREDIT)
    //-------------------------------------------------

    public WalletResponse topup(String userId, Double amount) {

        if (amount == null || amount <= 0) {
            throw new com.ecommerce.paymentwallet.common.exception.BadRequestException(
                "Top-up amount must be greater than zero"
            );
        }

        String status = walletRepository.getWalletStatus(userId);
        if ("BLOCKED".equalsIgnoreCase(status)) {
            throw new com.ecommerce.paymentwallet.common.exception.BadRequestException(
                "Wallet is blocked — cannot top up"
            );
        }

        Double current = walletRepository.getBalance(userId);
        walletRepository.updateBalance(userId, current + amount);

        walletRepository.saveTransaction(
                idGenerator.generateWalletTransactionId(),
                walletRepository.getWalletId(userId),
                "TOPUP",
                null,
                userId,
                amount,
                "CREDIT",
                "SUCCESS"
        );

        return walletRepository.getWallet(userId);
    }

    public List<WalletTransactionResponse> history(

        String userId

){

    return walletRepository.getTransactions(
            userId
    );

}

}
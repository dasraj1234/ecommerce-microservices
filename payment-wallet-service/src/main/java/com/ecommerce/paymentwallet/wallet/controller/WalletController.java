package com.ecommerce.paymentwallet.wallet.controller;

import com.ecommerce.paymentwallet.wallet.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.ecommerce.paymentwallet.wallet.service.WalletService;
import org.springframework.http.ResponseEntity;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    /*
     * Create Wallet
     */

    @PostMapping("/create")
    public WalletResponse createWallet(

            @RequestBody WalletCreateRequest request){

        return walletService.createWallet(
                request.getUserId()
        );

    }

    /*
     * Wallet Details
     */

    @GetMapping("/{userId}")

    public WalletResponse getWallet(

            @PathVariable String userId){

        return walletService.getWallet(
                userId
        );

    }

    /*
     * Create / Reset PIN
     */

    @PostMapping("/set-pin")

    public String setPin(

            @RequestBody WalletPinRequest request){

        return walletService.setPin(

                request.getUserId(),

                request.getPin()

        );

    }

    /*
     * Verify PIN
     */

    @PostMapping("/verify-pin")

    public boolean verifyPin(

            @RequestBody WalletPinRequest request){

        return walletService.verifyPin(

                request.getUserId(),

                request.getPin()

        );

    }

    /*
     * Top-up Wallet
     */

    @PostMapping("/topup")
    public ResponseEntity<WalletResponse> topup(
            @RequestBody WalletTopupRequest request) {

        WalletResponse response = walletService.topup(
                request.getUserId(),
                request.getAmount()
        );

        return ResponseEntity.ok(response);
    }

    /*
     * Change PIN — customer only, verifies old PIN before setting new one.
     * Admin must never call this endpoint.
     */
    @PostMapping("/change-pin")
    public ResponseEntity<String> changePin(
            @RequestBody WalletChangePinRequest request) {
        try {
            String result = walletService.changePin(
                    request.getUserId(),
                    request.getOldPin(),
                    request.getNewPin()
            );
            return ResponseEntity.ok(result);
        } catch (com.ecommerce.paymentwallet.common.exception.BadRequestException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    /*
     * Wallet History
     */

    @GetMapping("/history/{userId}")

    public List<WalletTransactionResponse> history(

            @PathVariable String userId){

        return walletService.history(
                userId
        );

    }

}
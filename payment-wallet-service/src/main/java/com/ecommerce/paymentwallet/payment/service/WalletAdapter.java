package com.ecommerce.paymentwallet.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WalletAdapter {

    private final RestTemplate restTemplate;

    private final String WALLET_URL = "http://localhost:8082/wallet/debit";

    public void debit(String userId, double amount) {

        try {
            Map<String, Object> req = new HashMap<>();
            req.put("userId", userId);
            req.put("amount", amount);

            Map response = restTemplate.postForObject(
                    WALLET_URL,
                    req,
                    Map.class
            );

            if (response == null || !"SUCCESS".equals(response.get("status"))) {
                throw new RuntimeException("Wallet debit failed");
            }

        } catch (Exception e) {
            log.error("Wallet debit failed for user {}", userId, e);
            throw new RuntimeException("Insufficient balance or wallet error");
        }
    }
}
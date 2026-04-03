package com.ecommerce.paymentwallet.common.util;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class IdGenerator {

    public String generatePaymentId() {
        return "P-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
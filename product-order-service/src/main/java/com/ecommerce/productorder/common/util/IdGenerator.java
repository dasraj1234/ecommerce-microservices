package com.ecommerce.productorder.common.util;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class IdGenerator {

    public String generateOrderId() {

        return "ORD-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8);

    }

    public String generateProductId() {

        return "PROD-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8);

    }

    public String generateIdempotencyKey() {

        return "IDEMP-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 10);

    }
}
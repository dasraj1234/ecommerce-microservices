package com.ecommerce.paymentwallet.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderClient {

    private final RestTemplate restTemplate;

    // 🔥 CHANGE when real service URL is available
    private final String ORDER_SERVICE_URL = "http://localhost:8081/orders/";

    public void validateOrder(String orderId) {

        try {
            String url = ORDER_SERVICE_URL + orderId;

            Object response = restTemplate.getForObject(url, Object.class);

            if (response == null) {
                throw new RuntimeException("Order not found");
            }

        } catch (Exception e) {
            log.error("Order validation failed for {}", orderId, e);
            throw new RuntimeException("Invalid or non-existing Order ID");
        }
    }
}
package com.ecommerce.productorder.client;

import com.ecommerce.productorder.client.dto.PaymentResponse;
import com.ecommerce.productorder.order.dto.PaymentRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PaymentClient {

    private final RestTemplate restTemplate;

    @Value("${payment.service.url}")
    private String paymentServiceUrl;

    public PaymentClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public PaymentResponse processPayment(PaymentRequest request) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PaymentRequest> entity =
                new HttpEntity<>(request, headers);

        ResponseEntity<PaymentResponse> response =
                restTemplate.postForEntity(
                        paymentServiceUrl + "/payments/process",
                        entity,
                        PaymentResponse.class
                );

        return response.getBody();
    }
}
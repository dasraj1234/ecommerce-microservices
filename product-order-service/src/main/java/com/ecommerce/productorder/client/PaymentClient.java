package com.ecommerce.productorder.client;

import com.ecommerce.productorder.order.dto.PaymentRequest;
import org.springframework.stereotype.Service;

@Service
public class PaymentClient {

    public String processPayment(PaymentRequest request) {

        return "PAYMENT_SUCCESS";
    }
}

package com.ecommerce.paymentwallet.payment.dto;

import lombok.Data;

@Data
public class PaymentRequest {

    private String orderId;   // 🔥 NEW
    private String userId;
    private double amount;
    private String idempotencyKey;
}
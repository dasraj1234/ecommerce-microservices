package com.ecommerce.paymentwallet.payment.dto;

import lombok.Data;

@Data
public class PaymentDetailsResponse {

    private String paymentId;
    private String orderId;
    private String userId;
    private Double amount;
    private String status;
}
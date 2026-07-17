package com.ecommerce.paymentwallet.payment.dto;

import lombok.Data;

@Data
public class RazorpayVerifyRequest {

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    private String userId;

    private String orderId;

    private String idempotencyKey; //fixed inconsistency 13th june

    private Double amount;  //fixed inconsistency 13th june

    private String paymentMethod;

    public String getPaymentMethod() {
    return paymentMethod;
}

public void setPaymentMethod(String paymentMethod) {
    this.paymentMethod = paymentMethod;
}
}
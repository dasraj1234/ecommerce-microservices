package com.ecommerce.paymentwallet.payment.dto;

public class PaymentRequest {

    private String orderId;
    private String userId;
    private double amount;
    private String idempotencyKey;

    public String getOrderId() {
        return orderId;
    }
//improvements 14th june
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
    //improvements 14th june
}
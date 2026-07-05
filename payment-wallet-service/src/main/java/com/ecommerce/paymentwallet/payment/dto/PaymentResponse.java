package com.ecommerce.paymentwallet.payment.dto;

public class PaymentResponse {

    private String paymentId;
    private String status;
    private String message;

    

    public PaymentResponse() {
    }

    public PaymentResponse(String paymentId,
                           String status,
                           String message) {
        this.paymentId = paymentId;
        this.status = status;
        this.message = message;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getStatus() {
        return status;
    }
//improvements 14th june
    public void setStatus(String status) {
        this.status = status;
    }
//improvements 14th june
    public String getMessage() {
        return message;
    }
//improvements 14th june
    public void setMessage(String message) {
        this.message = message;
    }
}
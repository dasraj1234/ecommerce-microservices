//razorpay integration 12th june

package com.ecommerce.paymentwallet.payment.dto;

import lombok.Data;

@Data
public class RazorpayCreateOrderRequest {

    private String userId;

    private String orderId;

    private Double amount;
}
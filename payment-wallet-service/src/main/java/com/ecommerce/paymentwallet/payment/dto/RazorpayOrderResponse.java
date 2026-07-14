package com.ecommerce.paymentwallet.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RazorpayOrderResponse {

    private String razorpayOrderId;

    private String orderId; 

    private String key;

    private Double amount;

    private String currency;
}
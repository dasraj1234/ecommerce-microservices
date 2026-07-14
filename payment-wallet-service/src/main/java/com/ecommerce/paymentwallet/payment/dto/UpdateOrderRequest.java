package com.ecommerce.paymentwallet.payment.dto;

import lombok.Data;

@Data
public class UpdateOrderRequest {

    private String paymentId;

    private String orderId;

}
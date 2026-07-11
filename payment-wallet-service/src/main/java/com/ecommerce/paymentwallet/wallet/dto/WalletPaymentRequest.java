package com.ecommerce.paymentwallet.wallet.dto;

import lombok.Data;

@Data
public class WalletPaymentRequest {

    private String userId;

    private String orderId;

    private String paymentId;

    private String pin;

    private Double amount;

}
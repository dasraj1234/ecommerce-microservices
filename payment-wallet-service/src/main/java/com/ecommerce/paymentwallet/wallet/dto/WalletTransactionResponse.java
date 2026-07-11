package com.ecommerce.paymentwallet.wallet.dto;

import lombok.Data;

@Data
public class WalletTransactionResponse {

    private String transactionId;

    private String paymentId;

    private String orderId;

    private Double amount;

    private String transactionType;

    private String status;

    private String transactionDate;

}
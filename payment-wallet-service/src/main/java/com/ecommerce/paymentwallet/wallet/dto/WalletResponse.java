package com.ecommerce.paymentwallet.wallet.dto;

import lombok.Data;

@Data
public class WalletResponse {

    private String walletId;

    private String userId;

    private Double balance;

    private String status;

    private String lastTransactionDate;

}
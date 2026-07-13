package com.ecommerce.paymentwallet.wallet.dto;

import lombok.Data;

@Data
public class WalletTopupRequest {

    private String userId;

    private Double amount;

}

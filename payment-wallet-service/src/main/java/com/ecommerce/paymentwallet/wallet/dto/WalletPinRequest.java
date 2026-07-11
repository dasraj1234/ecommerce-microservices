package com.ecommerce.paymentwallet.wallet.dto;

import lombok.Data;

@Data
public class WalletPinRequest {

    private String userId;

    private String pin;

}
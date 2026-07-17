package com.ecommerce.paymentwallet.wallet.dto;

import lombok.Data;

@Data
public class WalletChangePinRequest {

    private String userId;

    private String oldPin;

    private String newPin;

}

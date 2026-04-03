package com.ecommerce.paymentwallet.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor   // 🔥 FIX
@NoArgsConstructor
public class PaymentResponse {

    private String status;
    private String message;
}
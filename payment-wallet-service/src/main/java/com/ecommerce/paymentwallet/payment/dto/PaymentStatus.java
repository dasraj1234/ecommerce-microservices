package com.ecommerce.paymentwallet.payment.dto;
import lombok.extern.slf4j.Slf4j;
@Slf4j   // 🔥 MUST HAVE
public enum PaymentStatus {
    PENDING,
    SUCCESS,
    FAILED
}
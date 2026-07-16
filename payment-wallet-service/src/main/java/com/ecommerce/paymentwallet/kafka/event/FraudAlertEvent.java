package com.ecommerce.paymentwallet.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlertEvent {

    private String userId;
    private String walletId;
    private String reason;
    private double amount;
    private LocalDateTime timestamp;
}

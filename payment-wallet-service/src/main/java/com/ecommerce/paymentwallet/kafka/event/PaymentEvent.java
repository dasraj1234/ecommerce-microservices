package com.ecommerce.paymentwallet.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {

    private String paymentId;
    private String userId;
    private double amount;
    private String paymentMethod;
    private String status;
    private LocalDateTime timestamp;
}

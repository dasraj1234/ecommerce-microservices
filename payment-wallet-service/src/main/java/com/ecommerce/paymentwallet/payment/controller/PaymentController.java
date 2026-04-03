package com.ecommerce.paymentwallet.payment.controller;

import com.ecommerce.paymentwallet.payment.dto.PaymentRequest;
import com.ecommerce.paymentwallet.payment.dto.PaymentResponse;
import com.ecommerce.paymentwallet.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public PaymentResponse initiate(@RequestBody PaymentRequest request) {
        return paymentService.processPayment(request);
    }
}
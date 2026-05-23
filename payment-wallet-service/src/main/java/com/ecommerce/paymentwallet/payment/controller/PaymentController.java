package com.ecommerce.paymentwallet.payment.controller;
import java.util.List;
import com.ecommerce.paymentwallet.payment.dto.PaymentDetailsResponse;
import com.ecommerce.paymentwallet.payment.dto.PaymentRequest;
import com.ecommerce.paymentwallet.payment.dto.PaymentResponse;
import com.ecommerce.paymentwallet.payment.service.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(
    name = "Payment APIs",
    description = "Payment processing and payment history operations"
)


@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor

public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Process payment")
    @PostMapping("/process")
    public PaymentResponse process(
            @RequestBody PaymentRequest request) {

        return paymentService.processPayment(request);
    }

    @Operation(summary = "Get payment details by payment ID")
    @GetMapping("/{paymentId}")
public PaymentDetailsResponse getPayment(
        @PathVariable String paymentId) {

    return paymentService.getPayment(
            paymentId
    );
}

@Operation(summary = "Get payment history by user")
@GetMapping("/user/{userId}")
public List<PaymentDetailsResponse> getPaymentsByUser(
        @PathVariable String userId) {

    return paymentService.getPaymentsByUser(
            userId
    );
}

}
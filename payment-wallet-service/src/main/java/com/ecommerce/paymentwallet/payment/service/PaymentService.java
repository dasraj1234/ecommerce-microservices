package com.ecommerce.paymentwallet.payment.service;

import com.ecommerce.paymentwallet.payment.dto.*;
import com.ecommerce.paymentwallet.payment.repository.PaymentRepository;
import com.ecommerce.paymentwallet.payment.repository.PaymentLogRepository;
import com.ecommerce.paymentwallet.common.util.IdGenerator;
import com.ecommerce.paymentwallet.common.exception.BadRequestException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final PaymentLogRepository logRepo;
    private final WalletAdapter walletAdapter;
    private final OrderClient orderClient;
    private final IdGenerator idGenerator;

    public PaymentResponse processPayment(PaymentRequest req) {

        log.info("Processing payment for user {}", req.getUserId());

        // 🔥 VALIDATIONS
        if (req.getOrderId() == null || req.getOrderId().isBlank()) {
            throw new BadRequestException("Order ID is required");
        }

        if (req.getAmount() <= 0) {
            throw new BadRequestException("Amount must be greater than 0");
        }

        // 🔥 IDEMPOTENCY CHECK
        if (paymentRepo.existsByIdempotencyKey(req.getIdempotencyKey())) {
            return new PaymentResponse("SUCCESS", "Duplicate request already processed");
        }

        // 🔥 STEP 1: Validate Order via API
        orderClient.validateOrder(req.getOrderId());

        String paymentId = idGenerator.generatePaymentId();

        // 🔥 STEP 2: Insert PENDING
        paymentRepo.insert(
                paymentId,
                req.getOrderId(),
                req.getUserId(),
                req.getAmount(),
                PaymentStatus.PENDING.name(),
                req.getIdempotencyKey()
        );

        try {

            // 🔥 STEP 3: Call Wallet Service
            walletAdapter.debit(req.getUserId(), req.getAmount());

            // 🔥 STEP 4: Mark SUCCESS
            paymentRepo.updateStatus(
                    PaymentStatus.SUCCESS.name(),
                    paymentId
            );

            return new PaymentResponse("SUCCESS", "Payment successful");

        } catch (Exception e) {

            log.error("Payment failed for {}", paymentId, e);

            // 🔥 STEP 5: Mark FAILED
            paymentRepo.updateStatus(
                    PaymentStatus.FAILED.name(),
                    paymentId
            );

            throw e;
        }
    }
}
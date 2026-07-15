package com.ecommerce.paymentwallet.payment.service;

import com.ecommerce.paymentwallet.wallet.service.WalletService;
import com.ecommerce.paymentwallet.payment.dto.*;
import com.ecommerce.paymentwallet.payment.repository.PaymentRepository;
import com.ecommerce.paymentwallet.payment.repository.PaymentLogRepository;
import com.ecommerce.paymentwallet.common.util.IdGenerator;
import com.ecommerce.paymentwallet.common.util.JsonUtil;
import com.ecommerce.paymentwallet.common.exception.BadRequestException;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final WalletService walletService;

    private final PaymentRepository paymentRepo;

    private final PaymentLogRepository logRepo;

    private final IdGenerator idGenerator;

    public PaymentResponse processPayment(
            PaymentRequest req) {

        log.info(
                "Processing payment for user {}",
                req.getUserId()
        );

        if (req.getOrderId() == null
                || req.getOrderId().isBlank()) {

            throw new BadRequestException(
                    "Order ID is required"
            );
        }

        if (req.getAmount() <= 0) {

            throw new BadRequestException(
                    "Amount must be greater than 0"
            );
        }

        if (paymentRepo.existsByIdempotencyKey(
        req.getIdempotencyKey())) {

    return paymentRepo.findByIdempotencyKey(
            req.getIdempotencyKey()
    );
}

        String paymentId =
                idGenerator.generatePaymentId();

        paymentRepo.insert(
                paymentId,
                req.getOrderId(),
                req.getUserId(),
                req.getAmount(),
                PaymentStatus.PENDING.name(),
                req.getIdempotencyKey()
        );

        try {

           boolean debited = true;

/*
 * Wallet Payment
 */
if ("WALLET".equalsIgnoreCase(req.getPaymentMethod())) {

    boolean validPin =
            walletService.verifyPin(
                    req.getUserId(),
                    req.getWalletPin()
            );

    if (!validPin) {

        paymentRepo.updateStatus(
                PaymentStatus.FAILED.name(),
                paymentId
        );

        PaymentResponse response =
                new PaymentResponse(
                        paymentId,
                        "FAILED",
                        "Incorrect Wallet PIN"
                );

        logRepo.log(
                paymentId,
                JsonUtil.toJson(req),
                JsonUtil.toJson(response),
                "FAILED",
                "INVALID_PIN"
        );

        return response;
    }

   debited =
        walletService.debit(

                req.getUserId(),

                paymentId,

                req.getOrderId(),

                req.getAmount()

        );
}

/*
 * Razorpay Payment
 * Nothing to debit here because payment
 * is already completed through Razorpay.
 */

            if (!debited) {

                paymentRepo.updateStatus(
                        PaymentStatus.FAILED.name(),
                        paymentId
                );

                PaymentResponse response =
                        new PaymentResponse(
                                paymentId,
                                "FAILED",
                                "Insufficient wallet balance"
                        );

                logRepo.log(
                        paymentId,
                        JsonUtil.toJson(req),
                        JsonUtil.toJson(response),
                        "FAILED",
                        "INSUFFICIENT_BALANCE"
                );

                return response;
            }

            paymentRepo.updateStatus(
                    PaymentStatus.SUCCESS.name(),
                    paymentId
            );

            PaymentResponse response =
                    new PaymentResponse(
                            paymentId,
                            "SUCCESS",
                            "Payment successful"
                    );

            logRepo.log(
                    paymentId,
                    JsonUtil.toJson(req),
                    JsonUtil.toJson(response),
                    "SUCCESS",
                    "PAYMENT_SUCCESS"
            );

            return response;

        } catch (Exception e) {

            log.error(
                    "Payment failed for {}",
                    paymentId,
                    e
            );

            paymentRepo.updateStatus(
                    PaymentStatus.FAILED.name(),
                    paymentId
            );

            PaymentResponse response =
                    new PaymentResponse(
                            paymentId,
                            "FAILED",
                            e.getMessage()
                    );

            logRepo.log(
                    paymentId,
                    JsonUtil.toJson(req),
                    JsonUtil.toJson(response),
                    "FAILED",
                    e.getMessage()
            );

            return response;
        }
    }

    public PaymentDetailsResponse getPayment(
            String paymentId) {

        return paymentRepo.findByPaymentId(
                paymentId
        );
    }

    public List<PaymentDetailsResponse> getPaymentsByUser(
            String userId) {

        return paymentRepo.findByUserId(
                userId
        );
    }

    public long countPayments() {

        return paymentRepo.countAll();
    }

    public List<PaymentDetailsResponse> getAllPayments() {

        return paymentRepo.findAll();
    }
}
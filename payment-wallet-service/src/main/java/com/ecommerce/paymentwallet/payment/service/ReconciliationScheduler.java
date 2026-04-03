package com.ecommerce.paymentwallet.payment.service;

import com.ecommerce.paymentwallet.payment.repository.*;
import com.ecommerce.paymentwallet.wallet.service.WalletService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ReconciliationScheduler {

    private final PaymentRepository paymentRepo;
    private final TransactionRepository txnRepo;
    private final WalletService walletService;

    public ReconciliationScheduler(PaymentRepository p,
                                   TransactionRepository t,
                                   WalletService w) {
        this.paymentRepo = p;
        this.txnRepo = t;
        this.walletService = w;
    }

    @Scheduled(fixedRate = 300000)
    public void reconcile() {

        List<Map<String, Object>> success =
            paymentRepo.findByStatus("SUCCESS");

        for (Map<String, Object> p : success) {

            String pid = (String) p.get("payment_id");
            String userId = (String) p.get("user_id");
            Double amt = (Double) p.get("amount");

            if (!txnRepo.existsByPaymentId(pid)) {
                walletService.debit(userId, amt);
            }
        }
    }
}
package com.ecommerce.paymentwallet.payment.service;

import com.ecommerce.paymentwallet.common.util.IdGenerator;
import com.ecommerce.paymentwallet.notification.service.NotificationService;
import com.ecommerce.paymentwallet.payment.repository.PaymentLogRepository;
import com.ecommerce.paymentwallet.payment.repository.PaymentRepository;
import com.ecommerce.paymentwallet.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Runs every 5 minutes. Finds WALLET payments whose order was CANCELLED and
 * automatically credits the wallet back (refund).
 *
 * Skips refund if the wallet is BLOCKED due to fraud — in that case the
 * cancellation was triggered by the fraud rule, not a normal failure.
 */
@Service
@RequiredArgsConstructor
public class ReconciliationScheduler {

    private final PaymentRepository paymentRepository;
    private final PaymentLogRepository logRepository;
    private final WalletRepository walletRepository;
    private final IdGenerator idGenerator;
    private final NotificationService notificationService;

    @Scheduled(fixedRateString = "${reconciliation.interval-ms:300000}")
    public void reconcile() {

        List<Map<String, Object>> candidates =
                paymentRepository.findWalletPaymentsForRefund();

        if (!candidates.isEmpty()) {
            System.out.println("RECONCILE: " + candidates.size() + " payment(s) eligible for refund");
        }

        for (Map<String, Object> row : candidates) {

            String paymentId = (String) row.get("payment_id");
            String orderId   = (String) row.get("order_id");
            String userId    = (String) row.get("user_id");
            double amount    = ((Number) row.get("amount")).doubleValue();

            try {
                // If the wallet was blocked for fraud, do not refund
                String blockedReason = walletRepository.getBlockedReason(userId);
                if (blockedReason != null && blockedReason.toLowerCase().contains("fraud")) {
                    System.out.println("RECONCILE SKIP (fraud) userId=" + userId
                            + " paymentId=" + paymentId);
                    continue;
                }

                // Credit wallet
                Double current = walletRepository.getBalance(userId);
                walletRepository.updateBalance(userId, current + amount);

                // Record wallet transaction
                String txnId    = idGenerator.generateWalletTransactionId();
                String walletId = walletRepository.getWalletId(userId);
                walletRepository.saveTransaction(
                        txnId, walletId, paymentId, orderId,
                        userId, amount, "CREDIT", "REFUND");

                // Mark payment as REFUNDED so the scheduler skips it next run
                paymentRepository.updateStatus("REFUNDED", paymentId);

                // Audit log
                logRepository.log(
                        paymentId,
                        "{\"reconcile\":\"auto\",\"orderId\":\"" + orderId + "\"}",
                        "{\"status\":\"REFUNDED\",\"amount\":" + amount + "}",
                        "REFUNDED",
                        "AUTO_RECONCILE");

                // Email user in background
                final String uid = userId;
                final String pid = paymentId;
                final String oid = orderId;
                final double amt = amount;
                new Thread(() -> {
                    try {
                        String email = walletRepository.getUserEmail(uid);
                        if (email != null) {
                            notificationService.sendRefundMail(email, uid, pid, oid, amt);
                        }
                    } catch (Exception ex) {
                        System.out.println("RECONCILE email failed userId=" + uid + ": " + ex.getMessage());
                    }
                }).start();

                System.out.println("RECONCILE REFUNDED userId=" + userId
                        + " paymentId=" + paymentId + " ₹" + amount);

            } catch (Exception ex) {
                System.out.println("RECONCILE ERROR paymentId=" + paymentId
                        + ": " + ex.getMessage());
                ex.printStackTrace();
            }
        }
    }
}

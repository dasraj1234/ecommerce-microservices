package com.ecommerce.paymentwallet.kafka.fraud;

import com.ecommerce.paymentwallet.kafka.event.FraudAlertEvent;
import com.ecommerce.paymentwallet.kafka.event.PaymentEvent;
import com.ecommerce.paymentwallet.kafka.producer.PaymentEventProducer;
import com.ecommerce.paymentwallet.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class FraudRuleEngine {

    private final PaymentEventProducer producer;
    private final WalletRepository walletRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${fraud.single-txn-limit}")
    private double singleTxnLimit;

    @Value("${fraud.txn-count-limit}")
    private int txnCountLimit;

    @Value("${fraud.txn-window-minutes}")
    private int txnWindowMinutes;

    public void evaluate(PaymentEvent event) {

        if (!"SUCCESS".equals(event.getStatus())) return;

        // Rule 1 — single transaction above limit
        if (event.getAmount() >= singleTxnLimit) {
            flagUser(event, "High-value transaction: ₹" + event.getAmount());
            return;
        }

        // Rule 2 — too many transactions in a short window
        int recentCount = countRecentTransactions(event.getUserId());
        if (recentCount >= txnCountLimit) {
            flagUser(event, recentCount + " transactions in last " + txnWindowMinutes + " minutes");
        }
    }

    private int countRecentTransactions(String userId) {
        String sql =
            "SELECT COUNT(*) FROM payments " +
            "WHERE user_id = ? " +
            "AND status = 'SUCCESS' " +
            "AND created_date >= DATE_SUB(NOW(), INTERVAL ? MINUTE)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId, txnWindowMinutes);
        return count != null ? count : 0;
    }

    private void flagUser(PaymentEvent event, String reason) {
        log.warn("FRAUD DETECTED for user={} reason={}", event.getUserId(), reason);

        String walletId;
        try {
            walletId = walletRepository.getWalletId(event.getUserId());
        } catch (Exception e) {
            walletId = "UNKNOWN";
        }

        FraudAlertEvent alert = new FraudAlertEvent(
                event.getUserId(),
                walletId,
                reason,
                event.getAmount(),
                LocalDateTime.now()
        );

        producer.publishFraudAlert(alert);
    }
}

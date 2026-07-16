package com.ecommerce.paymentwallet.kafka.consumer;

import com.ecommerce.paymentwallet.kafka.event.FraudAlertEvent;
import com.ecommerce.paymentwallet.notification.service.NotificationService;
import com.ecommerce.paymentwallet.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FraudAlertConsumer {

    private final WalletRepository walletRepository;
    private final NotificationService notificationService;

    @KafkaListener(
        topics = "${kafka.topic.fraud-alerts}",
        groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consume(FraudAlertEvent event) {
        log.warn("Processing FraudAlert for user={} reason={}", event.getUserId(), event.getReason());

        // Block the wallet
        try {
            walletRepository.blockWallet(event.getUserId(), "Fraud detected: " + event.getReason());
            log.info("Wallet blocked for user={}", event.getUserId());
        } catch (Exception e) {
            log.error("Failed to block wallet for user={}", event.getUserId(), e);
        }

        // Send alert email
        try {
            notificationService.sendFraudAlertMail(
                    event.getUserId(),
                    event.getReason(),
                    event.getAmount()
            );
            log.info("Fraud alert email sent for user={}", event.getUserId());
        } catch (Exception e) {
            log.error("Failed to send fraud alert email for user={}", event.getUserId(), e);
        }
    }
}

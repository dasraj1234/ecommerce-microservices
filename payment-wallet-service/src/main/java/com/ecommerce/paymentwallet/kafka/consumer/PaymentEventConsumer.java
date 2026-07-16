package com.ecommerce.paymentwallet.kafka.consumer;

import com.ecommerce.paymentwallet.kafka.event.PaymentEvent;
import com.ecommerce.paymentwallet.kafka.fraud.FraudRuleEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private final FraudRuleEngine fraudRuleEngine;

    @KafkaListener(
        topics = "${kafka.topic.payment-events}",
        groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consume(PaymentEvent event) {
        log.info("Received PaymentEvent: paymentId={} user={} amount={} status={}",
                event.getPaymentId(), event.getUserId(), event.getAmount(), event.getStatus());
        fraudRuleEngine.evaluate(event);
    }
}

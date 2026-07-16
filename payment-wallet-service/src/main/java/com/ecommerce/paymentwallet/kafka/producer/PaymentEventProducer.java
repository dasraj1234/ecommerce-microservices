package com.ecommerce.paymentwallet.kafka.producer;

import com.ecommerce.paymentwallet.kafka.event.FraudAlertEvent;
import com.ecommerce.paymentwallet.kafka.event.PaymentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.payment-events}")
    private String paymentEventsTopic;

    @Value("${kafka.topic.fraud-alerts}")
    private String fraudAlertsTopic;

    public void publishPaymentEvent(PaymentEvent event) {
        kafkaTemplate.send(paymentEventsTopic, event.getUserId(), event);
        log.info("Published PaymentEvent for user={} paymentId={} status={}",
                event.getUserId(), event.getPaymentId(), event.getStatus());
    }

    public void publishFraudAlert(FraudAlertEvent event) {
        kafkaTemplate.send(fraudAlertsTopic, event.getUserId(), event);
        log.info("Published FraudAlertEvent for user={} reason={}", event.getUserId(), event.getReason());
    }
}

//email smtp implemented.

package com.ecommerce.paymentwallet.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
@Service
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    public NotificationService(
            JavaMailSender mailSender) {

        this.mailSender = mailSender;
    }

    public void sendPaymentSuccessMail(

            String email,

            String customerName,

            String paymentId,

            Double amount) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "IMPORTANT! Your bank account is in danger!"
        );

        message.setText(

                "Dear " + customerName +

                "\n\nPayment Successful."

                + "\nPayment ID : " + paymentId

                + "\nAmount : ₹" + amount

                + "\n\nThank You for shopping with EcomVerse."
        );

        mailSender.send(message);
    }
}
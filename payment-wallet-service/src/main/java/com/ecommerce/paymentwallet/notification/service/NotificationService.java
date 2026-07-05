//email smtp implemented.

package com.ecommerce.paymentwallet.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
@Service
@Slf4j

public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
        private String fromEmail;

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

        message.setFrom(fromEmail);
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

        System.out.println("FROM = " + fromEmail);
        System.out.println("TO = " + email);

        mailSender.send(message);
    }
}
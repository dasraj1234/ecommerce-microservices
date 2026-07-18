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
                "Payment Successful — EcomVerse"
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

    public void sendWalletPinMail(String email, String userId, String pin) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("EcomVerse — Your Wallet PIN");
        message.setText(
                "Hello,\n\n"
                + "Your EcomVerse wallet PIN has been set successfully.\n\n"
                + "User ID  : " + userId + "\n"
                + "Your PIN : " + pin + "\n\n"
                + "Use this PIN to authorise wallet payments at checkout.\n"
                + "Do not share this PIN with anyone.\n\n"
                + "If you did not request this, please contact support immediately.\n\n"
                + "— EcomVerse Team"
        );
        mailSender.send(message);
    }

    public void sendRefundMail(String email, String userId, String paymentId, String orderId, double amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("EcomVerse — Wallet Refund Processed");
        message.setText(
                "Hello,\n\n"
                + "Your wallet has been automatically refunded for a cancelled order.\n\n"
                + "User ID    : " + userId + "\n"
                + "Order ID   : " + orderId + "\n"
                + "Payment ID : " + paymentId + "\n"
                + "Refund     : ₹" + amount + "\n\n"
                + "The amount has been credited back to your EcomVerse wallet.\n\n"
                + "— EcomVerse Team"
        );
        mailSender.send(message);
    }

    public void sendFraudAlertMail(String userId, String reason, double amount) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(fromEmail);

        message.setSubject("⚠️ FRAUD ALERT — Wallet Blocked: " + userId);

        message.setText(
                "Fraud detected and wallet blocked.\n\n"
                + "User ID  : " + userId + "\n"
                + "Reason   : " + reason + "\n"
                + "Amount   : ₹" + amount + "\n\n"
                + "The wallet has been automatically blocked. "
                + "Please review and take action."
        );

        mailSender.send(message);
    }
}
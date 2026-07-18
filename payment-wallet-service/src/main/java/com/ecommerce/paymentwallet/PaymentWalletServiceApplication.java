package com.ecommerce.paymentwallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PaymentWalletServiceApplication {

    public static void main(String[] args) {

        SpringApplication.run(
                PaymentWalletServiceApplication.class,
                args
        );
    }
}
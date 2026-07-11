package com.ecommerce.paymentwallet.common.util;

import com.ecommerce.paymentwallet.common.repository.SequenceRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class IdGenerator {

    private final SequenceRepository sequenceRepository;

    public IdGenerator(
            SequenceRepository sequenceRepository) {

        this.sequenceRepository = sequenceRepository;
    }

    public String generatePaymentId() {

        int number =
                sequenceRepository.getNextNumber(
                        "PAYMENT"
                );

        String date =
                LocalDate.now()
                        .format(
                                DateTimeFormatter.ofPattern(
                                        "yyyyMMdd"
                                )
                        );

        return String.format(

                "PAY%s%06d",

                date,

                number
        );
    }


public String generateWalletId() {

    int number =
            sequenceRepository.getNextNumber(
                    "WALLET"
            );

    return String.format(
            "WALLET%06d",
            number
    );
}

public String generateWalletTransactionId() {

    int number =
            sequenceRepository.getNextNumber(
                    "WALLET_TXN"
            );

    return String.format(
            "WTXN%06d",
            number
    );
}
}
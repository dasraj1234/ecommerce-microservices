package com.ecommerce.productorder.common.util;

import com.ecommerce.productorder.common.repository.SequenceRepository;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class IdGenerator {

    private final SequenceRepository sequenceRepository;

    public IdGenerator(SequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    public String generateProductId(

        String categoryCode,

        Integer sequence) {

    return String.format(

            "PRD%s%06d",

            categoryCode,

            sequence
    );
}

    public String generateOrderId() {

    int number =
            sequenceRepository.getNextNumber("ORDER");

    String date =
            LocalDate.now()
                    .format(
                        DateTimeFormatter
                                .ofPattern("yyyyMMdd")
                    );

    return String.format(
            "ORD%s%06d",
            date,
            number
    );
}

    public String generateIdempotencyKey() {

        return "IDEMP" + System.currentTimeMillis();
    }
}
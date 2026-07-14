package com.ecommerce.paymentwallet.admin.service;

import com.ecommerce.paymentwallet.admin.dto.PaymentMISResponse;
import com.ecommerce.paymentwallet.admin.repository.PaymentMISRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentMISService {

    private final PaymentMISRepository repository;

    public List<PaymentMISResponse> getMIS(

            String fromDate,

            String toDate,

            String status,

            String paymentMethod

    ){

        return repository.getPayments(

                fromDate,

                toDate,

                status,

                paymentMethod

        );

    }

}
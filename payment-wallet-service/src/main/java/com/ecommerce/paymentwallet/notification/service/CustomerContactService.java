//email smtp implemented.

package com.ecommerce.paymentwallet.notification.service;

import com.ecommerce.paymentwallet.notification.dto.CustomerContact;
import com.ecommerce.paymentwallet.notification.repository.CustomerContactRepository;

import org.springframework.stereotype.Service;

@Service
public class CustomerContactService {

    private final CustomerContactRepository repository;

    public CustomerContactService(
            CustomerContactRepository repository) {

        this.repository = repository;
    }

    public CustomerContact findByUserId(
            String userId) {

        return repository.findByUserId(
                userId
        );
    }
}
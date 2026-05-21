package com.ecommerce.productorder.inventory.service;

import com.ecommerce.productorder.inventory.repository.InventoryRepository;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    private final InventoryRepository repository;

    public InventoryService(InventoryRepository repository) {

        this.repository = repository;

    }

    public boolean reduce(String productId,
                          Integer quantity) {

        return repository.reduceStock(
                productId,
                quantity
        );
    }
}
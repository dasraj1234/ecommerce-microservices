package com.ecommerce.productorder.product.service;

import com.ecommerce.productorder.common.util.IdGenerator;
import com.ecommerce.productorder.product.dto.ProductRequest;
import com.ecommerce.productorder.product.dto.ProductResponse;
import com.ecommerce.productorder.product.repository.ProductRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repository;

    private final IdGenerator idGenerator;

    public ProductService(ProductRepository repository,
                          IdGenerator idGenerator) {

        this.repository = repository;

        this.idGenerator = idGenerator;
    }

    public String create(ProductRequest request) {

        String productId =
                idGenerator.generateProductId();

        repository.createProduct(productId, request);

        return productId;
    }

    public List<ProductResponse> search(String name,
                                        String category,
                                        Double maxPrice) {

        return repository.searchProducts(name, category, maxPrice);
    }
}

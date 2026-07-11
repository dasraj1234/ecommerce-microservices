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

        System.out.println(
        "CATEGORY RECEIVED = "
        + request.getCategoryCode()
);
        
        Integer sequence =
        repository.getNextSequence(
                request.getCategoryCode()
        );

String productId =
        idGenerator.generateProductId(

                request.getCategoryCode(),

                sequence
        );

        repository.createProduct(productId, request);

        return productId;
    }

    public List<ProductResponse> search(String name,
                                        String category,
                                        Double maxPrice) {

        return repository.searchProducts(name, category, maxPrice);
    }

public ProductResponse getProductById(
        String productId) {

    return repository.findById(productId);
}

public String deleteProduct(
        String productId) {

    int rows =
            repository.deleteById(productId);

    if(rows==0){

        throw new IllegalArgumentException(
                "Product not found"
        );
    }

    return "Product deleted successfully";
}

}

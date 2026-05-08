package com.project.product.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    // CREATE
    public Product addProduct(Product product) {
        return repository.save(product);
    }

    // GET ALL
    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    // GET BY ID
    public Product getProductById(Long id) {
        return repository.findById(id).orElse(null);
    }

    // UPDATE
    public Product updateProduct(Long id, Product product) {

        Product existing =
                repository.findById(id).orElse(null);

        if (existing != null) {

            existing.setName(product.getName());
            existing.setPrice(product.getPrice());
            existing.setQuantity(product.getQuantity());

            return repository.save(existing);
        }

        return null;
    }

    // DELETE
    public String deleteProduct(Long id) {

        repository.deleteById(id);

        return "Product Deleted Successfully";
    }
}

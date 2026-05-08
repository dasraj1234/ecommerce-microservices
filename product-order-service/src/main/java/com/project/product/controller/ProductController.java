package com.project.product.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.project.product.entity.Product;
import com.project.product.service.ProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService service;

    // CREATE
    @PostMapping
    public Product addProduct(
            @RequestBody Product product) {

        return service.addProduct(product);
    }

    // GET ALL
    @GetMapping
    public List<Product> getAllProducts() {

        return service.getAllProducts();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Product getProductById(
            @PathVariable Long id) {

        return service.getProductById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return service.updateProduct(id, product);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteProduct(
            @PathVariable Long id) {

        return service.deleteProduct(id);
    }
}
package com.ecommerce.productorder.product.controller;

import com.ecommerce.productorder.common.dto.ApiResponse;
import com.ecommerce.productorder.product.dto.ProductRequest;
import com.ecommerce.productorder.product.dto.ProductResponse;
import com.ecommerce.productorder.product.service.ProductService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@CrossOrigin
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {

        this.service = service;
    }

    @PostMapping("/create")
    public ApiResponse<String> create(@RequestBody ProductRequest request) {

        return ApiResponse.success(
                "Product created successfully",
                service.create(request)
        );
    }

    @GetMapping("/search")
    public ApiResponse<List<ProductResponse>> search(@RequestParam(required = false) String name,
                                                     @RequestParam(required = false) String category,
                                                     @RequestParam(required = false) Double maxPrice) {

        return ApiResponse.success(
                "Products fetched successfully",
                service.search(name, category, maxPrice)
        );
    }
}

package com.ecommerce.productorder.product.controller;

import com.ecommerce.productorder.common.dto.ApiResponse;
import com.ecommerce.productorder.product.dto.ProductRequest;
import com.ecommerce.productorder.product.dto.ProductResponse;
import com.ecommerce.productorder.product.dto.ProductUpdateRequest;
import com.ecommerce.productorder.product.service.ProductService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;

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

    @Operation(summary = "Create new product")
    @PostMapping("/create")
    public ApiResponse<String> create(@Valid @RequestBody ProductRequest request) {

        return ApiResponse.success(
                "Product created successfully",
                service.create(request)
        );
    }

    @Operation(summary = "Search products")
    @GetMapping("/search")
    public ApiResponse<List<ProductResponse>> search(@RequestParam(required = false) String name,
                                                     @RequestParam(required = false) String category,
                                                     @RequestParam(required = false) Double maxPrice) {

        return ApiResponse.success(
                "Products fetched successfully",
                service.search(name, category, maxPrice)
        );
    }
//improvements 14th june
    @Operation(summary = "Get all products")
@GetMapping
public ApiResponse<List<ProductResponse>> getAllProducts() {

    return ApiResponse.success(
            "Products fetched successfully",
            service.search(null, null, null)
    );
}
@GetMapping("/{productId}")
public ApiResponse<ProductResponse> getProduct(
        @PathVariable String productId) {

    return ApiResponse.success(
            "Product fetched successfully",
            service.getProductById(productId)
    );
}

@DeleteMapping("/{productId}")
public ApiResponse<String> deleteProduct(
        @PathVariable String productId) {

    return ApiResponse.success(
            service.deleteProduct(productId),
            productId
    );
}

@Operation(summary = "Update product name, price and stock")
@PutMapping("/{productId}")
public ApiResponse<String> updateProduct(
        @PathVariable String productId,
        @Valid @RequestBody ProductUpdateRequest request) {

    return ApiResponse.success(
            service.updateProduct(productId, request),
            productId
    );
}
}

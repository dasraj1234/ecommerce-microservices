package com.ecommerce.productorder.order.controller;

import com.ecommerce.productorder.common.dto.ApiResponse;
import com.ecommerce.productorder.order.dto.OrderHistoryResponse;
import com.ecommerce.productorder.order.dto.OrderRequest;
import com.ecommerce.productorder.order.dto.OrderResponse;
import com.ecommerce.productorder.order.model.OrderStatus;
import com.ecommerce.productorder.order.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;



@RestController

@RequestMapping("/orders")

@CrossOrigin

public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {

        this.service = service;

    }

    @Operation(summary = "Create order")
  @PostMapping("/create")
public ApiResponse<OrderResponse> create(
        @RequestBody OrderRequest request) {

    OrderResponse response =
            service.createOrder(request);

    if ("CONFIRMED".equals(response.getStatus())) {

        return ApiResponse.success(
                "Order placed successfully",
                response
        );
    }

    return ApiResponse.failure(
            response.getMessage()
    );
}
@Operation(summary = "Update order status")
@PatchMapping("/{orderId}/status")
public ApiResponse<OrderResponse> updateStatus(
        @PathVariable String orderId,
        @RequestParam OrderStatus status) {

    OrderResponse response =
            service.updateStatus(orderId, status);

    return ApiResponse.<OrderResponse>success(
            "Order status updated successfully",
            response
    );
}
        @Operation(summary = "Cancel order")
    @PatchMapping("/{orderId}/cancel")

    public ApiResponse<OrderResponse> cancel(@PathVariable String orderId) {

        return ApiResponse.success(
                "Order cancelled successfully",
                service.cancelOrder(orderId)
        );
    }

    @Operation(summary = "Get order history by user")
    @GetMapping("/history/{userId}")

    public ApiResponse<List<OrderHistoryResponse>> history(@PathVariable String userId) {

        return ApiResponse.success(
                "Order history fetched successfully",
                service.history(userId)
        );
    }

    //razorpay integration 12th june
    @GetMapping("/stock/check")
public boolean checkStock(
        @RequestParam String productId,
        @RequestParam Integer quantity) {

    return service.hasStock(
            productId,
            quantity
    );
}

@GetMapping("/generate-order-id")
public Map<String, String> generateOrderId() {

    return Map.of(
        "orderId",
        service.generateOrderId()
    );

}

}

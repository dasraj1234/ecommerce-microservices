package com.ecommerce.productorder.order.controller;

import com.ecommerce.productorder.common.dto.ApiResponse;
import com.ecommerce.productorder.order.dto.OrderHistoryResponse;
import com.ecommerce.productorder.order.dto.OrderRequest;
import com.ecommerce.productorder.order.dto.OrderResponse;
import com.ecommerce.productorder.order.model.OrderStatus;
import com.ecommerce.productorder.order.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/orders")

@CrossOrigin

public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {

        this.service = service;

    }

    @PostMapping("/create")

    public ApiResponse<OrderResponse> create(@RequestBody OrderRequest request) {

        return ApiResponse.success(
                "Order placed successfully",
                service.createOrder(request)
        );

    }

    @PatchMapping("/{orderId}/status")

    public ApiResponse<OrderResponse> updateStatus(@PathVariable String orderId,
                                                   @RequestParam OrderStatus status) {

        return ApiResponse.success(
                "Order status updated successfully",
                service.updateStatus(orderId, status)
        );
    }

    @PatchMapping("/{orderId}/cancel")

    public ApiResponse<OrderResponse> cancel(@PathVariable String orderId) {

        return ApiResponse.success(
                "Order cancelled successfully",
                service.cancelOrder(orderId)
        );
    }

    @GetMapping("/history/{userId}")

    public ApiResponse<List<OrderHistoryResponse>> history(@PathVariable String userId) {

        return ApiResponse.success(
                "Order history fetched successfully",
                service.history(userId)
        );
    }
}

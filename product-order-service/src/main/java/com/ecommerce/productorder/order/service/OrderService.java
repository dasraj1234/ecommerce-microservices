package com.ecommerce.productorder.order.service;

import com.ecommerce.productorder.client.PaymentClient;
import com.ecommerce.productorder.common.exception.InsufficientStockException;
import com.ecommerce.productorder.common.exception.OrderNotFoundException;
import com.ecommerce.productorder.common.util.IdGenerator;
import com.ecommerce.productorder.common.util.JsonUtil;
import com.ecommerce.productorder.inventory.repository.InventoryRepository;
import com.ecommerce.productorder.order.dto.OrderHistoryResponse;
import com.ecommerce.productorder.order.dto.OrderRequest;
import com.ecommerce.productorder.order.dto.OrderResponse;
import com.ecommerce.productorder.order.dto.PaymentRequest;
import com.ecommerce.productorder.order.model.OrderStatus;
import com.ecommerce.productorder.order.repository.OrderItemRepository;
import com.ecommerce.productorder.order.repository.OrderRepository;
import com.ecommerce.productorder.order.repository.OrderReqResRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderService.class);

    private OrderRepository orderRepository;

    private InventoryRepository inventoryRepository;

    private OrderItemRepository itemRepository;

    private OrderReqResRepository logRepository;

    private PaymentClient paymentClient;

    private IdGenerator idGenerator;

    public OrderService(OrderRepository orderRepository,
                        InventoryRepository inventoryRepository,
                        OrderItemRepository itemRepository,
                        OrderReqResRepository logRepository,
                        PaymentClient paymentClient,
                        IdGenerator idGenerator) {

        this.orderRepository = orderRepository;

        this.inventoryRepository = inventoryRepository;

        this.itemRepository = itemRepository;

        this.logRepository = logRepository;

        this.paymentClient = paymentClient;

        this.idGenerator = idGenerator;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        LOGGER.info("Creating order for user {}", request.getUserId());

        boolean stockUpdated =
                inventoryRepository.reduceStock(

                        request.getProductId(),

                        request.getQuantity()
                );

        if (!stockUpdated) {

            throw new InsufficientStockException(request.getProductId());
        }

        String orderId =
                idGenerator.generateOrderId();

        String idempotencyKey =
                idGenerator.generateIdempotencyKey();

        orderRepository.createOrder(

                orderId,

                request,

                idempotencyKey
        );

        orderRepository.updateOrderStatus(

                orderId,

                OrderStatus.PROCESSING.name()
        );

        itemRepository.save(

                orderId,

                request.getProductId(),

                request.getQuantity(),

                request.getTotalAmount(),

                request.getTotalAmount()
        );

        PaymentRequest paymentRequest =
                new PaymentRequest();

        paymentRequest.setUserId(
                request.getUserId()
        );

        paymentRequest.setAmount(
                request.getTotalAmount()
        );

        paymentRequest.setOrderId(orderId);

        paymentRequest.setIdempotencyKey(
                idempotencyKey
        );

        String paymentResponse =
                paymentClient.processPayment(
                        paymentRequest
                );

        orderRepository.updateOrderStatus(

                orderId,

                OrderStatus.CONFIRMED.name(),

                paymentResponse
        );

        logRepository.save(

                orderId,

                JsonUtil.toJson(request),

                paymentResponse,

                "SUCCESS",

                "PAYMENT_SUCCESS"
        );

        LOGGER.info("Order {} confirmed and inventory reduced", orderId);

        OrderResponse response = new OrderResponse();
        response.setOrderId(orderId);
        response.setStatus(OrderStatus.CONFIRMED.name());
        response.setMessage("Order placed successfully");

        return response;
    }

    @Transactional
    public OrderResponse updateStatus(String orderId,
                                      OrderStatus status) {

        String currentStatus = orderRepository.findStatusByOrderId(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (OrderStatus.CANCELLED.name().equals(currentStatus)) {
            throw new IllegalStateException("Cancelled order cannot be updated");
        }

        int rows = orderRepository.updateOrderStatus(orderId, status.name());

        if (rows == 0) {
            throw new OrderNotFoundException(orderId);
        }

        LOGGER.info("Order {} moved from {} to {}", orderId, currentStatus, status);

        OrderResponse response = new OrderResponse();
        response.setOrderId(orderId);
        response.setStatus(status.name());
        response.setMessage("Order status updated successfully");

        return response;
    }

    @Transactional
    public OrderResponse cancelOrder(String orderId) {

        String currentStatus = orderRepository.findStatusByOrderId(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (OrderStatus.CANCELLED.name().equals(currentStatus)) {
            throw new IllegalStateException("Order is already cancelled");
        }

        if (OrderStatus.DELIVERED.name().equals(currentStatus)) {
            throw new IllegalStateException("Delivered order cannot be cancelled");
        }

        itemRepository.findStockItemsByOrderId(orderId)
                .forEach(item -> inventoryRepository.restoreStock(
                        item.getProductId(),
                        item.getQuantity()
                ));

        orderRepository.updateOrderStatus(orderId, OrderStatus.CANCELLED.name());

        LOGGER.info("Order {} cancelled and stock restored", orderId);

        OrderResponse response = new OrderResponse();
        response.setOrderId(orderId);
        response.setStatus(OrderStatus.CANCELLED.name());
        response.setMessage("Order cancelled and stock restored successfully");

        return response;
    }

    public List<OrderHistoryResponse> history(String userId) {

        return orderRepository.findHistoryByUserId(userId);
    }
}

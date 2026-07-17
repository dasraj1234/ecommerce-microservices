package com.ecommerce.productorder.order.service;

import com.ecommerce.productorder.client.PaymentClient;
import com.ecommerce.productorder.client.dto.PaymentResponse;
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

import org.springframework.beans.factory.annotation.Value;

@Service
public class OrderService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderService.class);

    @Value("${wallet.mock.enabled:false}")
        private boolean mockWallet;

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

      LOGGER.info(
            "USER ID RECEIVED = {}",
            request.getUserId()
    );

    LOGGER.info(
            "PAYMENT METHOD RECEIVED = {}",
            request.getPaymentMethod()
    );

    LOGGER.info(
            "Creating order for user {}",
            request.getUserId()
    );

    LOGGER.info(
        "PRODUCT ID RECEIVED = {}",
        request.getProductId()
);



   String orderId;

if (request.getOrderId() != null &&
    !request.getOrderId().isBlank()) {

    orderId = request.getOrderId();

} else {

    orderId = idGenerator.generateOrderId();

}

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


    if ("RAZORPAY".equalsIgnoreCase(
        request.getPaymentMethod())) {


                LOGGER.info(
    "PAYMENT METHOD RECEIVED = {}",
    request.getPaymentMethod()
);

 boolean stockUpdated =
            inventoryRepository.reduceStock(
                    request.getProductId(),
                    request.getQuantity()
            );

 if (!stockUpdated) {
        throw new InsufficientStockException(
                request.getProductId()
        );
    }

    orderRepository.updateOrderStatus(
        orderId,
        OrderStatus.CONFIRMED.name()
);

LOGGER.info(
    "PAYMENT ID RECEIVED = {}",
    request.getPaymentId()
);

orderRepository.updatePaymentId(
        orderId,
        request.getPaymentId()
);

    LOGGER.info(
            "Order {} confirmed via Razorpay",
            orderId
    );

    OrderResponse response =
            new OrderResponse();

    response.setOrderId(orderId);
    response.setStatus(
            OrderStatus.CONFIRMED.name()
    );
    response.setMessage(
            "Order placed successfully"
    );

    return response;
}


    PaymentRequest paymentRequest = new PaymentRequest();
    paymentRequest.setUserId(request.getUserId());
    paymentRequest.setAmount(request.getTotalAmount());
    paymentRequest.setOrderId(orderId);
    paymentRequest.setIdempotencyKey(idempotencyKey);
    paymentRequest.setPaymentMethod(request.getPaymentMethod());
    paymentRequest.setWalletPin(request.getWalletPin());

    // Tracks whether we reduced stock so the catch block knows whether to restore it.
    // Stock is reduced AFTER payment confirmation — not before — for wallet payments.
    boolean stockReduced = false;

    try {

        PaymentResponse paymentResponse;

        if (mockWallet) {
            paymentResponse = new PaymentResponse();
            paymentResponse.setPaymentId("P-MOCK-" + System.currentTimeMillis());
            paymentResponse.setStatus("SUCCESS");
            paymentResponse.setMessage("Mock wallet payment success");
            LOGGER.info("MOCK WALLET PAYMENT USED for order {}", orderId);
        } else {
            paymentResponse = paymentClient.processPayment(paymentRequest);
        }

        if ("SUCCESS".equals(paymentResponse.getStatus())) {

            // Reduce stock only after payment is confirmed — avoids holding inventory
            // for failed payments, and ensures the restore in the catch block is correct.
            stockReduced = inventoryRepository.reduceStock(
                    request.getProductId(),
                    request.getQuantity()
            );

            if (!stockReduced) {
                // Edge case: stock ran out between order creation and payment confirmation.
                // The wallet was debited — a refund would be needed in a real system.
                // For now, cancel the order and surface the error to the caller.
                throw new InsufficientStockException(request.getProductId());
            }

            orderRepository.updateOrderStatus(
                    orderId,
                    OrderStatus.CONFIRMED.name(),
                    paymentResponse.getPaymentId()
            );

            logRepository.save(
                    orderId,
                    JsonUtil.toJson(request),
                    JsonUtil.toJson(paymentResponse),
                    "SUCCESS",
                    "PAYMENT_SUCCESS"
            );

            LOGGER.info("Order {} confirmed, stock reduced", orderId);

            OrderResponse response = new OrderResponse();
            response.setOrderId(orderId);
            response.setStatus(OrderStatus.CONFIRMED.name());
            response.setMessage("Order placed successfully");
            return response;

        } else {

            // Payment failed — no stock was touched, so no restore needed.
            orderRepository.updateOrderStatus(orderId, OrderStatus.CANCELLED.name());

            logRepository.save(
                    orderId,
                    JsonUtil.toJson(request),
                    JsonUtil.toJson(paymentResponse),
                    "FAILED",
                    paymentResponse.getMessage()
            );

            throw new RuntimeException(paymentResponse.getMessage());
        }

    } catch (Exception ex) {

        // Only restore stock if we actually reduced it before the exception.
        if (stockReduced) {
            inventoryRepository.restoreStock(request.getProductId(), request.getQuantity());
        }

        orderRepository.updateOrderStatus(orderId, OrderStatus.CANCELLED.name());

        logRepository.save(
                orderId,
                JsonUtil.toJson(request),
                "{}",
                "FAILED",
                ex.getMessage()
        );

        LOGGER.error("Order {} failed: {}", orderId, ex.getMessage());

        OrderResponse response = new OrderResponse();
        response.setOrderId(orderId);
        response.setStatus(OrderStatus.CANCELLED.name());
        response.setMessage(ex.getMessage());
        return response;
    }
}
//razorpay integration 12th june
public boolean hasStock(
        String productId,
        Integer quantity) {

    Integer stock =
            inventoryRepository
                    .getStock(productId);

    return stock != null
            && stock >= quantity;
}

//razorpay integration 12th june
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

    public List<OrderHistoryResponse> allOrders() {

        return orderRepository.findAllOrders();
    }

    public OrderResponse updateStatus(String orderId, OrderStatus status) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateStatus'");
    }

    public String generateOrderId() {

    return idGenerator.generateOrderId();

}
}

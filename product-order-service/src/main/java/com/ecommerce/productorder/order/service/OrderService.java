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

    //@Transactional
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

    orderRepository.updateOrderStatus(
        orderId,
        OrderStatus.CONFIRMED.name()
);

 if (!stockUpdated) {
        throw new InsufficientStockException(
                request.getProductId()
        );
    }

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


    PaymentRequest paymentRequest =
            new PaymentRequest();

    paymentRequest.setUserId(
            request.getUserId()
    );

    paymentRequest.setAmount(
            request.getTotalAmount()
    );

    paymentRequest.setOrderId(
            orderId
    );

    paymentRequest.setIdempotencyKey(
            idempotencyKey
    );

    try {

       PaymentResponse paymentResponse;   //@raj please change to original wallet code after doing your wallet service code

if(mockWallet){     

    paymentResponse =
            new PaymentResponse();

    paymentResponse.setPaymentId(
            "P-MOCK-" +
            System.currentTimeMillis()
    );

    paymentResponse.setStatus(
            "SUCCESS"
    );

    paymentResponse.setMessage(
            "Mock wallet payment success"
    );

    LOGGER.info(
            "MOCK WALLET PAYMENT USED"
    );

}else{

    paymentResponse =
            paymentClient.processPayment(  //@raj please change to original wallet code after doing your wallet service code

                    paymentRequest
            );
}

        if ("SUCCESS".equals(
                paymentResponse.getStatus())) {

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

            LOGGER.info(
                    "Order {} confirmed and inventory reduced",
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

        } else {

            inventoryRepository.restoreStock(
                    request.getProductId(),
                    request.getQuantity()
            );

            orderRepository.updateOrderStatus(
                    orderId,
                    OrderStatus.CANCELLED.name()
            );

            logRepository.save(
                    orderId,
                    JsonUtil.toJson(request),
                    JsonUtil.toJson(paymentResponse),
                    "FAILED",
                    paymentResponse.getMessage()
            );

            throw new RuntimeException(
                    paymentResponse.getMessage()
            );
        }

    } catch (Exception ex) {

    inventoryRepository.restoreStock(
            request.getProductId(),
            request.getQuantity()
    );

    orderRepository.updateOrderStatus(
            orderId,
            OrderStatus.CANCELLED.name()
    );

    logRepository.save(
            orderId,
            JsonUtil.toJson(request),
            "{}",
            "FAILED",
            ex.getMessage()
    );

    OrderResponse response =
            new OrderResponse();

    response.setOrderId(orderId);
    response.setStatus(
            OrderStatus.CANCELLED.name()
    );
    response.setMessage(
        ex.getMessage()
);

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
}

package com.ecommerce.productorder.order.repository;

import com.ecommerce.productorder.order.dto.OrderHistoryResponse;
import com.ecommerce.productorder.order.dto.OrderRequest;
import com.ecommerce.productorder.sql.SqlQueries;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;

import java.util.List;
import java.util.Optional;

@Repository
public class OrderRepository {

    private final JdbcTemplate jdbcTemplate;

    public OrderRepository(JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;

    }


 

    public void createOrder(String orderId,
                            OrderRequest request,
                            String idempotencyKey) {

        jdbcTemplate.update(

                SqlQueries.CREATE_ORDER,

                orderId,

                request.getUserId(),

                request.getTotalAmount(),

                "CREATED",

                idempotencyKey
        );
    }

    public void updateOrderStatus(String orderId,
                                  String status,
                                  String paymentId) {

        jdbcTemplate.update(

                SqlQueries.UPDATE_ORDER_STATUS,

                status,

                paymentId,

                orderId
        );
    }

    public int updateOrderStatus(String orderId,
                                 String status) {

        return jdbcTemplate.update(

                SqlQueries.UPDATE_ORDER_STATUS_ONLY,

                status,

                orderId
        );
    }

    public Optional<String> findStatusByOrderId(String orderId) {

        List<String> statuses = jdbcTemplate.query(

                SqlQueries.FIND_ORDER_STATUS,

                (rs, rowNum) -> rs.getString("status"),

                orderId
        );

        return statuses.stream().findFirst();
    }

    public List<OrderHistoryResponse> findHistoryByUserId(String userId) {

        return jdbcTemplate.query(

                SqlQueries.FIND_ORDER_HISTORY,

                (rs, rowNum) -> {
                    OrderHistoryResponse history = new OrderHistoryResponse();
                    history.setOrderId(rs.getString("order_id"));
                    history.setUserId(rs.getString("user_id"));
                    history.setTotalAmount(rs.getDouble("total_amount"));
                    history.setStatus(rs.getString("status"));
                    history.setPaymentId(rs.getString("payment_id"));  //improvements 14th june
                    Timestamp timestamp = rs.getTimestamp("created_date");

DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern(
                "d MMMM yyyy, hh:mm a"
        );

history.setCreatedDate(
        timestamp.toLocalDateTime()
                 .format(formatter)
);
                    history.setUpdatedDate(rs.getTimestamp("updated_date").toString());
                    return history;
                },

                userId
        );
    }

    public int updatePaymentId(
        String orderId,
        String paymentId) {

    String sql =
        "UPDATE orders " +
        "SET payment_id=? " +
        "WHERE order_id=?";

    return jdbcTemplate.update(
            sql,
            paymentId,
            orderId
    );
}
}

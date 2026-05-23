package com.ecommerce.productorder.order.repository;

import com.ecommerce.productorder.sql.SqlQueries;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class OrderReqResRepository {

    private final JdbcTemplate jdbcTemplate;

    public OrderReqResRepository(JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;

    }

    public void save(String orderId,
                     String requestPayload,
                     String responsePayload,
                     String status,
                     String reason) {

        jdbcTemplate.update(

                SqlQueries.INSERT_ORDER_LOG,

                orderId,

                requestPayload,

                responsePayload,

                status,

                reason
        );
    }
}
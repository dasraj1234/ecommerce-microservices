package com.ecommerce.paymentwallet.payment.repository;

import com.ecommerce.paymentwallet.common.util.QueryConstants;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PaymentLogRepository {

    private final JdbcTemplate jdbc;

    public PaymentLogRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void log(String pid, String req, String res, String status, String reason) {
        jdbc.update(QueryConstants.INSERT_PAYMENT_LOG, pid, req, res, status, reason);
    }
}
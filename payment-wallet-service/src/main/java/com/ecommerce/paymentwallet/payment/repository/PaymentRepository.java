package com.ecommerce.paymentwallet.payment.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
@Repository
public class PaymentRepository {

    private final JdbcTemplate jdbcTemplate;

    public PaymentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

public void insert(String paymentId, String orderId, String userId,
                   double amount, String status, String idempotencyKey) {

    String sql = "INSERT INTO payments " +
            "(payment_id, order_id, user_id, amount, status, idempotency_key) " +
            "VALUES (?, ?, ?, ?, ?, ?)";

    jdbcTemplate.update(sql,
            paymentId, orderId, userId, amount, status, idempotencyKey);
}

    public void updateStatus(String status, String paymentId) {

        String sql = "UPDATE payments SET status=? WHERE payment_id=?";

        jdbcTemplate.update(sql, status, paymentId);
    }

    // 🔥 CHANGED: idempotency support
    public boolean existsByIdempotencyKey(String key) {

        String sql = "SELECT COUNT(*) FROM payments WHERE idempotency_key=?";

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                key
        );

        return count != null && count > 0;
    }

    // 🔥 FIX: Required for ReconciliationScheduler
// 🔥 FIX: Match scheduler expectation
public List<Map<String, Object>> findByStatus(String status) {

    String sql = "SELECT * FROM payments WHERE status=?";

    return jdbcTemplate.queryForList(sql, status);
}
}
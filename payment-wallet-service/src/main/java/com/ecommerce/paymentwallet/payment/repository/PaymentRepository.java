package com.ecommerce.paymentwallet.payment.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.ecommerce.paymentwallet.payment.dto.PaymentDetailsResponse;
import com.ecommerce.paymentwallet.payment.dto.PaymentResponse;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
@Repository
public class PaymentRepository {

    private final JdbcTemplate jdbcTemplate;

    public PaymentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private String formatDate(java.sql.Timestamp timestamp) {

    LocalDateTime dateTime =
            timestamp.toLocalDateTime();

    int day = dateTime.getDayOfMonth();

    String suffix;

    if(day >= 11 && day <= 13){

        suffix = "th";

    } else {

        switch(day % 10){

            case 1: suffix = "st"; break;
            case 2: suffix = "nd"; break;
            case 3: suffix = "rd"; break;
            default: suffix = "th";
        }
    }

    return day
            + suffix
            + " "
            + dateTime.format(
                    DateTimeFormatter.ofPattern(
                            "MMMM yyyy, hh:mm a"
                    )
            );
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

    // Total number of payments (admin dashboard KPI).
    public long countAll() {

        String sql = "SELECT COUNT(*) FROM payments";

        Long count = jdbcTemplate.queryForObject(
                sql,
                Long.class
        );

        return count != null ? count : 0L;
    }

    // 🔥 FIX: Required for ReconciliationScheduler
// 🔥 FIX: Match scheduler expectation
public List<Map<String, Object>> findByStatus(String status) {

    String sql = "SELECT * FROM payments WHERE status=?";

    return jdbcTemplate.queryForList(sql, status);
}

public PaymentDetailsResponse findByPaymentId(
        String paymentId) {

    String sql =
            "SELECT * FROM payments WHERE payment_id=?";

    return jdbcTemplate.queryForObject(
            sql,
            (rs,rowNum)->{

                PaymentDetailsResponse p =
                        new PaymentDetailsResponse();

                p.setPaymentId(
                        rs.getString("payment_id"));

                p.setOrderId(
                        rs.getString("order_id"));

                p.setUserId(
                        rs.getString("user_id"));

                p.setAmount(
                        rs.getDouble("amount"));

                p.setStatus(
                        rs.getString("status"));

p.setCreatedDate(
        formatDate(
                rs.getTimestamp("created_date")
        )
);
                return p;
            },
            paymentId
    );
}

// Shared mapping for payment rows — used by per-user history and the admin
// all-payments listing.
private final org.springframework.jdbc.core.RowMapper<PaymentDetailsResponse> paymentRowMapper =
        (rs, rowNum) -> {

            PaymentDetailsResponse p =
                    new PaymentDetailsResponse();

            p.setPaymentId(
                    rs.getString("payment_id"));

            p.setOrderId(
                    rs.getString("order_id"));

            p.setUserId(
                    rs.getString("user_id"));

            p.setAmount(
                    rs.getDouble("amount"));

            p.setStatus(
                    rs.getString("status"));

            p.setCreatedDate(
                    formatDate(
                            rs.getTimestamp("created_date")
                    )
            );
            return p;
        };

public List<PaymentDetailsResponse> findByUserId(
        String userId) {

    String sql =
            "SELECT * FROM payments WHERE user_id=? ORDER BY created_date DESC";

    return jdbcTemplate.query(
            sql,
            paymentRowMapper,
            userId
    );
}

// Admin: every payment across all users, newest first.
public List<PaymentDetailsResponse> findAll() {

    String sql =
            "SELECT * FROM payments ORDER BY created_date DESC";

    return jdbcTemplate.query(
            sql,
            paymentRowMapper
    );
}

public PaymentResponse findByIdempotencyKey(
        String idempotencyKey) {

    String sql =
            "SELECT payment_id,status " +
            "FROM payments " +
            "WHERE idempotency_key=?";

    return jdbcTemplate.queryForObject(
            sql,
            (rs, rowNum) ->
                    new PaymentResponse(
                            rs.getString("payment_id"),
                            rs.getString("status"),
                            "Duplicate request already processed"
                    ),
            idempotencyKey
    );
}

//razorpay integration 12th june
public void saveRazorpayPayment(
        String paymentId,
        String orderId,
        String userId,
        Double amount,
        String idempotency_key,
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature) {

    String sql =
        "INSERT INTO payments " +
        "(payment_id,order_id,user_id,amount,idempotency_key,status," +
        "razorpay_order_id,razorpay_payment_id,razorpay_signature) " +
        "VALUES (?,?,?,?,?,?,?,?,?)";

   jdbcTemplate.update(
    sql,
    paymentId,
    orderId,
    userId,
    amount,
    idempotency_key,
    "SUCCESS",
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
);
}

}
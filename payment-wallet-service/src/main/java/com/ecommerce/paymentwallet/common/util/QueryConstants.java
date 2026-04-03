package com.ecommerce.paymentwallet.common.util;

public class QueryConstants {

    // PAYMENT
    public static final String INSERT_PAYMENT =
        "INSERT INTO payments(payment_id, order_id, user_id, amount, status, idempotency_key, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";

    public static final String UPDATE_PAYMENT_STATUS =
        "UPDATE payments SET status = ?, updated_date = NOW() WHERE payment_id = ?";

    public static final String FIND_BY_IDEMPOTENCY =
        "SELECT * FROM payments WHERE idempotency_key = ?";

    public static final String FIND_BY_STATUS =
        "SELECT * FROM payments WHERE status = ?";

    // 🔥 UPDATED TRANSACTION (wallet_id added)
    public static final String INSERT_TRANSACTION =
        "INSERT INTO transactions(txn_id, payment_id, wallet_id, user_id, type, amount, created_date) VALUES (?, ?, ?, ?, ?, ?, NOW())";

    public static final String EXISTS_TRANSACTION =
        "SELECT COUNT(*) FROM transactions WHERE payment_id = ?";

    // PAYMENT LOG
    public static final String INSERT_PAYMENT_LOG =
        "INSERT INTO payment_req_res(payment_id, request_payload, response_payload, status, reason, created_date) VALUES (?, ?, ?, ?, ?, NOW())";
}
package com.ecommerce.paymentwallet.payment.repository;

import com.ecommerce.paymentwallet.common.util.QueryConstants;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class TransactionRepository {

    private final JdbcTemplate jdbc;

    public TransactionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // 🔥 UPDATED METHOD (walletId added)
    public void insert(String txnId, String paymentId, String walletId,
                       String userId, String type, Double amount) {

        jdbc.update(QueryConstants.INSERT_TRANSACTION,
                txnId, paymentId, walletId, userId, type, amount);
    }

    public boolean existsByPaymentId(String paymentId) {
        Integer count = jdbc.queryForObject(
                QueryConstants.EXISTS_TRANSACTION,
                Integer.class,
                paymentId
        );
        return count != null && count > 0;
    }
}
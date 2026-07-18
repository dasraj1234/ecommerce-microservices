package com.ecommerce.paymentwallet.wallet.repository;

import com.ecommerce.paymentwallet.wallet.dto.WalletResponse;
import com.ecommerce.paymentwallet.wallet.dto.WalletTransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class WalletRepository {

    private final JdbcTemplate jdbcTemplate;

    private String formatDate(Timestamp timestamp) {

        if (timestamp == null) {
            return "-";
        }

        return timestamp
                .toLocalDateTime()
                .format(
                        DateTimeFormatter.ofPattern(
                                "dd MMM yyyy hh:mm a"
                        )
                );
    }

    //--------------------------------------------------
    // CREATE WALLET
    //--------------------------------------------------

    public boolean exists(String userId) {

        String sql =
                "SELECT COUNT(*) " +
                "FROM wallets " +
                "WHERE user_id=?";

        Integer count =
                jdbcTemplate.queryForObject(
                        sql,
                        Integer.class,
                        userId
                );

        return count != null && count > 0;
    }

    public void createWallet(

            String walletId,

            String userId

    ) {

        String sql =

                "INSERT INTO wallets(" +

                        "wallet_id," +

                        "user_id," +

                        "balance," +

                        "status," +

                        "failed_attempts," +

                        "created_date," +

                        "updated_date" +

                        ") VALUES(?,?,0,'ACTIVE',0,NOW(),NOW())";

        jdbcTemplate.update(

                sql,

                walletId,

                userId

        );

    }

    //--------------------------------------------------
    // GET WALLET
    //--------------------------------------------------

    public WalletResponse getWallet(

            String userId

    ) {

        String sql =
                "SELECT * FROM wallets " +
                "WHERE user_id=?";

        return jdbcTemplate.queryForObject(

                sql,

                (rs, rowNum) -> {

                    WalletResponse wallet =
                            new WalletResponse();

                    wallet.setWalletId(
                            rs.getString("wallet_id"));

                    wallet.setUserId(
                            rs.getString("user_id"));

                    wallet.setBalance(
                            rs.getDouble("balance"));

                    wallet.setStatus(
                            rs.getString("status"));

                    wallet.setLastTransactionDate(

                            formatDate(

                                    rs.getTimestamp(
                                            "last_transaction_date"
                                    )
                            )
                    );

                    wallet.setHasPinSet(
                            rs.getString("wallet_pin") != null
                    );

                    return wallet;

                },

                userId
        );

    }

    //--------------------------------------------------
    // BALANCE
    //--------------------------------------------------

    public Double getBalance(

            String userId

    ) {

        String sql =

                "SELECT balance " +

                "FROM wallets " +

                "WHERE user_id=?";

        return jdbcTemplate.queryForObject(

                sql,

                Double.class,

                userId

        );

    }

    public void updateBalance(

            String userId,

            Double balance

    ) {

        String sql =

                "UPDATE wallets " +

                "SET balance=?," +

                "last_transaction_date=NOW()," +

                "updated_date=NOW() " +

                "WHERE user_id=?";

        jdbcTemplate.update(

                sql,

                balance,

                userId

        );

    }

    //--------------------------------------------------
    // WALLET ID
    //--------------------------------------------------

    public String getWalletId(

            String userId

    ) {

        String sql =

                "SELECT wallet_id " +

                "FROM wallets " +

                "WHERE user_id=?";

        return jdbcTemplate.queryForObject(

                sql,

                String.class,

                userId

        );

    }

    //--------------------------------------------------
    // PIN
    //--------------------------------------------------

    public String getEncodedPin(

            String userId

    ) {

        String sql =

                "SELECT wallet_pin " +

                "FROM wallets " +

                "WHERE user_id=?";

        return jdbcTemplate.queryForObject(

                sql,

                String.class,

                userId

        );

    }

    public String getUserEmail(String userId) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT email FROM users WHERE user_id=?",
                    String.class,
                    userId
            );
        } catch (Exception e) {
            return null;
        }
    }

    public void updatePin(

            String userId,

            String encodedPin

    ) {

        String sql =

                "UPDATE wallets " +

                "SET wallet_pin=?," +

                "updated_date=NOW() " +

                "WHERE user_id=?";

        jdbcTemplate.update(

                sql,

                encodedPin,

                userId

        );

    }

        //--------------------------------------------------
    // WALLET TRANSACTIONS
    //--------------------------------------------------

    public void saveTransaction(

            String transactionId,

            String walletId,

            String paymentId,

            String orderId,

            String userId,

            Double amount,

            String type,

            String status

    ) {

        String sql =

                "INSERT INTO wallet_transactions(" +

                        "transaction_id," +

                        "wallet_id," +

                        "payment_id," +

                        "order_id," +

                        "user_id," +

                        "amount," +

                        "transaction_type," +

                        "status," +

                        "transaction_date" +

                        ") VALUES(?,?,?,?,?,?,?,?,NOW())";

        jdbcTemplate.update(

                sql,

                transactionId,

                walletId,

                paymentId,

                orderId,

                userId,

                amount,

                type,

                status

        );

    }

    public List<WalletTransactionResponse> getTransactions(

            String userId

    ) {

        String sql =

                "SELECT * FROM wallet_transactions " +

                        "WHERE user_id=? " +

                        "ORDER BY transaction_date DESC";

        return jdbcTemplate.query(

                sql,

                (rs,rowNum)->{

                    WalletTransactionResponse tx =
                            new WalletTransactionResponse();

                    tx.setTransactionId(
                            rs.getString("transaction_id"));

                    tx.setPaymentId(
                            rs.getString("payment_id"));

                    tx.setOrderId(
                            rs.getString("order_id"));

                    tx.setAmount(
                            rs.getDouble("amount"));

                    tx.setTransactionType(
                            rs.getString("transaction_type"));

                    tx.setStatus(
                            rs.getString("status"));

                    tx.setTransactionDate(

                            formatDate(

                                    rs.getTimestamp(
                                            "transaction_date"
                                    )

                            )

                    );

                    return tx;

                },

                userId

        );

    }

    //--------------------------------------------------
    // WALLET SECURITY
    //--------------------------------------------------

    public String getWalletStatus(String userId) {

        return jdbcTemplate.queryForObject(

                "SELECT status FROM wallets WHERE user_id=?",

                String.class,

                userId

        );

    }

    public Integer getFailedAttempts(String userId) {

        return jdbcTemplate.queryForObject(

                "SELECT failed_attempts FROM wallets WHERE user_id=?",

                Integer.class,

                userId

        );

    }

    public void incrementFailedAttempts(String userId) {

        jdbcTemplate.update(

                "UPDATE wallets " +
                "SET failed_attempts=failed_attempts+1 " +
                "WHERE user_id=?",

                userId

        );

    }

    public void resetFailedAttempts(String userId) {

        jdbcTemplate.update(

                "UPDATE wallets " +

                "SET failed_attempts=0," +

                "blocked_reason=NULL " +

                "WHERE user_id=?",

                userId

        );

    }

    public Timestamp getBlockedUntil(String userId) {

        return jdbcTemplate.queryForObject(

                "SELECT blocked_until " +

                "FROM wallets " +

                "WHERE user_id=?",

                Timestamp.class,

                userId

        );

    }

    public void blockWallet(

            String userId,

            String reason

    ) {

        jdbcTemplate.update(

                "UPDATE wallets SET " +

                        "status='BLOCKED'," +

                        "failed_attempts=4," +

                        "blocked_reason=?," +

                        "blocked_until=DATE_ADD(NOW(),INTERVAL 30 MINUTE)," +

                        "updated_date=NOW() " +

                        "WHERE user_id=?",

                reason,

                userId

        );

    }

    public void unblockWallet(String userId) {

        jdbcTemplate.update(

                "UPDATE wallets SET " +

                        "status='ACTIVE'," +

                        "failed_attempts=0," +

                        "blocked_reason=NULL," +

                        "blocked_until=NULL," +

                        "updated_date=NOW() " +

                        "WHERE user_id=?",

                userId

        );

    }

    //--------------------------------------------------
    // SECURITY LOG
    //--------------------------------------------------

    public String getBlockedReason(String userId) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT blocked_reason FROM wallets WHERE user_id=?",
                    String.class,
                    userId
            );
        } catch (Exception e) {
            return null;
        }
    }

    public void saveSecurityLog(

            String walletId,

            String userId,

            String event,

            String remarks

    ) {

        jdbcTemplate.update(

                "INSERT INTO wallet_security_logs(" +

                        "wallet_id," +

                        "user_id," +

                        "event_type," +

                        "remarks" +

                        ") VALUES(?,?,?,?)",

                walletId,

                userId,

                event,

                remarks

        );

    }

}
package com.ecommerce.productorder.inventory.repository;

import com.ecommerce.productorder.sql.SqlQueries;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class InventoryRepository {

    private final JdbcTemplate jdbcTemplate;
//razorpay integration 12th june
    public Integer getStock(
        String productId) {

    return jdbcTemplate.queryForObject(

        """
        SELECT stock
        FROM products
        WHERE product_id = ?
        """,

        Integer.class,

        productId
    );
}
//razorpay integration 12th june

    public InventoryRepository(JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;

    }

    public boolean reduceStock(String productId,
                               Integer quantity) {

        int rows = jdbcTemplate.update(

                SqlQueries.REDUCE_STOCK,

                quantity,

                productId,

                quantity
        );

        return rows > 0;
    }

    public void restoreStock(String productId,
                             Integer quantity) {

        jdbcTemplate.update(

                SqlQueries.RESTORE_STOCK,

                quantity,

                productId
        );
    }
}

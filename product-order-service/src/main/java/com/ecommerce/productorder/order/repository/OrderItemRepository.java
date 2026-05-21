package com.ecommerce.productorder.order.repository;

import com.ecommerce.productorder.sql.SqlQueries;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OrderItemRepository {

    private final JdbcTemplate jdbcTemplate;

    public OrderItemRepository(JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;

    }

    public void save(String orderId,
                     String productId,
                     Integer quantity,
                     Double itemPrice,
                     Double totalPrice) {

        jdbcTemplate.update(

                SqlQueries.INSERT_ORDER_ITEM,

                orderId,

                productId,

                quantity,

                itemPrice,

                totalPrice
        );
    }

    public List<OrderItemStock> findStockItemsByOrderId(String orderId) {

        return jdbcTemplate.query(

                SqlQueries.FIND_ORDER_ITEMS,

                (rs, rowNum) -> new OrderItemStock(
                        rs.getString("product_id"),
                        rs.getInt("quantity")
                ),

                orderId
        );
    }

    public static class OrderItemStock {

        private final String productId;

        private final Integer quantity;

        public OrderItemStock(String productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public String getProductId() {
            return productId;
        }

        public Integer getQuantity() {
            return quantity;
        }
    }
}

package com.ecommerce.productorder.stats.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class OrderStatsRepository {

    private final JdbcTemplate jdbc;

    public OrderStatsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Top products by order count and total revenue. */
    public List<Map<String, Object>> topProducts(int limit) {
        String sql =
            "SELECT p.product_name, " +
            "       COUNT(oi.order_id) AS order_count, " +
            "       COALESCE(SUM(oi.total_price), 0) AS revenue " +
            "FROM order_items oi " +
            "JOIN products p ON oi.product_id = p.product_id " +
            "JOIN orders o ON oi.order_id = o.order_id " +
            "WHERE o.status = 'CONFIRMED' " +
            "GROUP BY p.product_id, p.product_name " +
            "ORDER BY order_count DESC " +
            "LIMIT ?";
        return jdbc.queryForList(sql, limit);
    }

    /** Order count and revenue by category. */
    public List<Map<String, Object>> byCategory() {
        String sql =
            "SELECT c.category_name, " +
            "       COUNT(oi.order_id) AS order_count, " +
            "       COALESCE(SUM(oi.total_price), 0) AS revenue " +
            "FROM order_items oi " +
            "JOIN products p ON oi.product_id = p.product_id " +
            "JOIN category_master c ON p.category_code = c.category_code " +
            "JOIN orders o ON oi.order_id = o.order_id " +
            "WHERE o.status = 'CONFIRMED' " +
            "GROUP BY c.category_code, c.category_name " +
            "ORDER BY order_count DESC";
        return jdbc.queryForList(sql);
    }

    /** Order count bucketed by price range. */
    public List<Map<String, Object>> byPriceRange() {
        String sql =
            "SELECT " +
            "  CASE " +
            "    WHEN total_amount < 500      THEN 'Under ₹500' " +
            "    WHEN total_amount < 2000     THEN '₹500 – ₹2000' " +
            "    WHEN total_amount < 5000     THEN '₹2000 – ₹5000' " +
            "    ELSE 'Above ₹5000' " +
            "  END AS price_range, " +
            "  COUNT(*) AS order_count " +
            "FROM orders " +
            "WHERE status = 'CONFIRMED' " +
            "GROUP BY price_range " +
            "ORDER BY MIN(total_amount)";
        return jdbc.queryForList(sql);
    }

    /** Monthly order count and revenue for the last 12 months. */
    public List<Map<String, Object>> monthly() {
        String sql =
            "SELECT DATE_FORMAT(created_date, '%b %Y') AS month, " +
            "       COUNT(*) AS order_count, " +
            "       COALESCE(SUM(total_amount), 0) AS revenue " +
            "FROM orders " +
            "WHERE status = 'CONFIRMED' " +
            "  AND created_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) " +
            "GROUP BY YEAR(created_date), MONTH(created_date) " +
            "ORDER BY YEAR(created_date), MONTH(created_date)";
        return jdbc.queryForList(sql);
    }

    /** Full MIS: product name, total orders, revenue, avg order value. */
    public List<Map<String, Object>> mis() {
        String sql =
            "SELECT p.product_name, " +
            "       COUNT(oi.order_id) AS total_orders, " +
            "       COALESCE(SUM(oi.total_price), 0) AS total_revenue, " +
            "       COALESCE(AVG(oi.total_price), 0) AS avg_order_value, " +
            "       COALESCE(SUM(oi.quantity), 0) AS total_quantity " +
            "FROM order_items oi " +
            "JOIN products p ON oi.product_id = p.product_id " +
            "JOIN orders o ON oi.order_id = o.order_id " +
            "WHERE o.status = 'CONFIRMED' " +
            "GROUP BY p.product_id, p.product_name " +
            "ORDER BY total_revenue DESC";
        return jdbc.queryForList(sql);
    }
}

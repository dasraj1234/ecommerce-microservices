package com.ecommerce.productorder.sql;

public class SqlQueries {

    public static final String CREATE_PRODUCT =

            "INSERT INTO products(product_id,product_name,category,price,stock,status) VALUES (?,?,?,?,?,?)";

    public static final String GET_PRODUCTS =

            "SELECT * FROM products WHERE status='ACTIVE'";

    public static final String SEARCH_PRODUCTS =

            "SELECT * FROM products WHERE status='ACTIVE' "
                    + "AND (? IS NULL OR LOWER(product_name) LIKE LOWER(CONCAT('%', ?, '%'))) "
                    + "AND (? IS NULL OR LOWER(category) = LOWER(?)) "
                    + "AND (? IS NULL OR price <= ?) "
                    + "ORDER BY product_name ASC";

    public static final String REDUCE_STOCK =

            "UPDATE products SET stock = stock - ? WHERE product_id=? AND stock >= ?";

    public static final String RESTORE_STOCK =

            "UPDATE products SET stock = stock + ? WHERE product_id=?";

    public static final String CREATE_ORDER =

            "INSERT INTO orders(order_id,user_id,total_amount,status,idempotency_key) VALUES (?,?,?,?,?)";

    public static final String INSERT_ORDER_ITEM =

            "INSERT INTO order_items(order_id,product_id,quantity,item_price,total_price) VALUES (?,?,?,?,?)";

    public static final String UPDATE_ORDER_STATUS =

            "UPDATE orders SET status=?, payment_id=? WHERE order_id=?";

    public static final String UPDATE_ORDER_STATUS_ONLY =

            "UPDATE orders SET status=? WHERE order_id=?";

    public static final String FIND_ORDER_STATUS =

            "SELECT status FROM orders WHERE order_id=?";

    public static final String FIND_ORDER_ITEMS =

            "SELECT product_id, quantity FROM order_items WHERE order_id=?";

    public static final String FIND_ORDER_HISTORY =

            "SELECT order_id,user_id,total_amount,status,created_date,updated_date "
                    + "FROM orders WHERE user_id=? ORDER BY created_date DESC";

    public static final String INSERT_ORDER_LOG =

            "INSERT INTO order_req_res(order_id,request_payload,response_payload,status,reason) VALUES (?,?,?,?,?)";
}

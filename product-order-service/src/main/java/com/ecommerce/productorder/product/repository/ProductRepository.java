package com.ecommerce.productorder.product.repository;

import com.ecommerce.productorder.product.dto.ProductRequest;
import com.ecommerce.productorder.product.dto.ProductResponse;
import com.ecommerce.productorder.sql.SqlQueries;
import com.ecommerce.productorder.common.exception.ResourceNotFoundException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ProductRepository {

    private final JdbcTemplate jdbcTemplate;

    public ProductRepository(JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;
    }

    public void createProduct(String productId,
                              ProductRequest request) {

        jdbcTemplate.update(

        SqlQueries.CREATE_PRODUCT,

        productId,

        request.getProductName(),

        request.getCategoryCode(),

        request.getCategoryPath(),

        request.getCategoryNamePath(),

        request.getPrice(),

        request.getStock(),

        "ACTIVE"
);
    }

    public List<ProductResponse> searchProducts(String name,
                                                String category,
                                                Double maxPrice) {

        return jdbcTemplate.query(

                SqlQueries.SEARCH_PRODUCTS,

                (rs, rowNum) -> {
                    ProductResponse product = new ProductResponse();
                    product.setProductId(rs.getString("product_id"));
product.setProductName(rs.getString("product_name"));
product.setCategory(rs.getString("category"));
product.setCategoryPath(rs.getString("category_path"));
product.setCategoryNamePath(rs.getString("category_name_path"));
product.setPrice(rs.getDouble("price"));
product.setStock(rs.getInt("stock"));
product.setStatus(rs.getString("status"));
                    return product;
                },

                name,
                name,
                category,
                category,
                maxPrice,
                maxPrice
        );
    }
    public Integer getNextSequence(
        String categoryCode) {

    List<Integer> result = jdbcTemplate.query(
    "SELECT last_sequence FROM category_sequence WHERE category_code=?",
    (rs, rowNum) -> rs.getInt("last_sequence"),
    categoryCode
);

if (result.isEmpty()) {
    throw new IllegalArgumentException(
        "Invalid category code: " + categoryCode
    );
}

Integer current = result.get(0);

    current++;

    jdbcTemplate.update(

            """
            UPDATE category_sequence
            SET last_sequence=?
            WHERE category_code=?
            """,

            current,

            categoryCode
    );

    return current;
}

public ProductResponse findById(
        String productId) {

    String sql =

        "SELECT " +
        "p.product_id," +
        "p.product_name," +
        "c.category_name AS category," +
        "p.category_path," +
        "p.category_name_path," +
        "p.price," +
        "p.stock," +
        "p.status " +
        "FROM products p " +
        "JOIN category_master c " +
        "ON p.category_code=c.category_code " +
        "WHERE p.product_id=?";

    List<ProductResponse> products =
            jdbcTemplate.query(

                    sql,

                    (rs,rowNum)->{

                        ProductResponse product =
                                new ProductResponse();

                        product.setProductId(
                                rs.getString("product_id"));

                        product.setProductName(
                                rs.getString("product_name"));

                        product.setCategory(
                                rs.getString("category"));

                        product.setCategoryPath(
                                rs.getString("category_path"));

                        product.setCategoryNamePath(
                                rs.getString("category_name_path"));

                        product.setPrice(
                                rs.getDouble("price"));

                        product.setStock(
                                rs.getInt("stock"));

                        product.setStatus(
                                rs.getString("status"));

                        return product;

                    },

                    productId
            );

    if(products.isEmpty()){

    throw new ResourceNotFoundException(
            "No product found with Product ID : "
            + productId
    );
}

    return products.get(0);

}

public int deleteById(String productId) {

    String sql =
            "DELETE FROM products WHERE product_id=?";

    return jdbcTemplate.update(
            sql,
            productId
    );
}
}

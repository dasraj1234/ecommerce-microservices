package com.ecommerce.productorder.product.repository;

import com.ecommerce.productorder.product.dto.ProductRequest;
import com.ecommerce.productorder.product.dto.ProductResponse;
import com.ecommerce.productorder.sql.SqlQueries;

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

                request.getCategory(),

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
}

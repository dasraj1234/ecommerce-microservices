package com.ecommerce.productorder.category.repository;

import com.ecommerce.productorder.category.dto.CategoryResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CategoryRepository {

    private final JdbcTemplate jdbcTemplate;

    public CategoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CategoryResponse> getLevelOneCategories() {

        String sql =
                """
                SELECT
                category_code,
                category_name
                FROM category_master
                WHERE level_no=1
                ORDER BY category_name
                """;

        return jdbcTemplate.query(sql,
                (rs,row)->{

                    CategoryResponse c =
                            new CategoryResponse();

                    c.setCategoryCode(
                            rs.getString("category_code"));

                    c.setCategoryName(
                            rs.getString("category_name"));

                    return c;
                });
    }

    public List<CategoryResponse> getChildCategories(
            String parentCode){

        String sql =
                """
                SELECT
                category_code,
                category_name
                FROM category_master
                WHERE parent_category_code=?
                ORDER BY category_name
                """;

        return jdbcTemplate.query(sql,

                (rs,row)->{

                    CategoryResponse c =
                            new CategoryResponse();

                    c.setCategoryCode(
                            rs.getString("category_code"));

                    c.setCategoryName(
                            rs.getString("category_name"));

                    return c;
                },

                parentCode);
    }

}
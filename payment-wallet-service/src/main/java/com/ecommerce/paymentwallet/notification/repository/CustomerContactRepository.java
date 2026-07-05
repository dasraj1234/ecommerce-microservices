//email smtp implemented.

package com.ecommerce.paymentwallet.notification.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.ecommerce.paymentwallet.notification.dto.CustomerContact;

@Repository
public class CustomerContactRepository {

    private final JdbcTemplate jdbcTemplate;

    public CustomerContactRepository(
            JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;
    }

    public CustomerContact findByUserId(
            String userId) {

        String sql =
                "SELECT * " +
                "FROM customer_contact " +
                "WHERE user_id=?";

        return jdbcTemplate.queryForObject(
                sql,
                (rs,rowNum)->{

                    CustomerContact c =
                            new CustomerContact();

                    c.setUserId(
                            rs.getString(
                                    "user_id"));

                    c.setCustomerName(
                            rs.getString(
                                    "customer_name"));

                    c.setEmail(
                            rs.getString(
                                    "email"));

                    c.setMobileNumber(
                            rs.getString(
                                    "mobile_number"));

                    return c;
                },
                userId
        );
    }
}
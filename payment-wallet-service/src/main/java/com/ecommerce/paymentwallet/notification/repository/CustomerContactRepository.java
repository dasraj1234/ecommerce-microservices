package com.ecommerce.paymentwallet.notification.repository;

import java.util.List;

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

    public CustomerContact findByUserId(String userId) {

        String sql =
                "SELECT user_id, username, email " +
                "FROM users " +
                "WHERE user_id = ?";

        List<CustomerContact> list =
                jdbcTemplate.query(
                        sql,
                        (rs, rowNum) -> {
                            CustomerContact c = new CustomerContact();
                            c.setUserId(rs.getString("user_id"));
                            c.setCustomerName(rs.getString("username"));
                            c.setEmail(rs.getString("email"));
                            return c;
                        },
                        userId
                );

        System.out.println("CUSTOMER LOOKUP for userId=" + userId
                + " → found=" + !list.isEmpty()
                + (list.isEmpty() ? "" : " email=" + list.get(0).getEmail()));

        return list.isEmpty() ? null : list.get(0);
    }
}
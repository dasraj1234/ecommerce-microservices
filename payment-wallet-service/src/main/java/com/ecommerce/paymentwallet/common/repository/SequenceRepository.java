package com.ecommerce.paymentwallet.common.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SequenceRepository {

    private final JdbcTemplate jdbcTemplate;

    public SequenceRepository(
            JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;
    }

    public synchronized int getNextNumber(
            String entity) {

        jdbcTemplate.update(

                "UPDATE id_sequence " +
                "SET last_number = last_number + 1 " +
                "WHERE entity_name=?",

                entity
        );

        return jdbcTemplate.queryForObject(

                "SELECT last_number " +
                "FROM id_sequence " +
                "WHERE entity_name=?",

                Integer.class,

                entity
        );
    }
}
package com.ecommerce.paymentwallet.admin.repository;

import com.ecommerce.paymentwallet.admin.dto.PaymentMISResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class PaymentMISRepository {

    private final JdbcTemplate jdbcTemplate;

    private String format(Timestamp timestamp){

        return timestamp
                .toLocalDateTime()
                .format(
                        DateTimeFormatter.ofPattern(
                                "dd MMM yyyy hh:mm a"
                        )
                );

    }

    public List<PaymentMISResponse> getPayments(

            String fromDate,

            String toDate,

            String status,

            String paymentMethod

    ){

        StringBuilder sql = new StringBuilder(

                "SELECT * FROM payments " +

                "WHERE DATE(created_date) BETWEEN ? AND ? "

        );

        if(status!=null && !status.equalsIgnoreCase("ALL")){

            sql.append(" AND status=? ");

        }

        if(paymentMethod!=null && !paymentMethod.equalsIgnoreCase("ALL")){

            sql.append(" AND payment_method=? ");

        }

        sql.append(

                " ORDER BY created_date DESC"

        );

        return jdbcTemplate.query(

                sql.toString(),

                ps->{

                    ps.setString(1,fromDate);

                    ps.setString(2,toDate);

                    int index=3;

                    if(status!=null && !status.equalsIgnoreCase("ALL")){

                        ps.setString(index++,status);

                    }

                    if(paymentMethod!=null && !paymentMethod.equalsIgnoreCase("ALL")){

                        ps.setString(index,paymentMethod);

                    }

                },

                (rs,row)->{

                    PaymentMISResponse p=new PaymentMISResponse();

                    p.setPaymentId(
                            rs.getString("payment_id"));

                    p.setOrderId(
                            rs.getString("order_id"));

                    p.setUserId(
                            rs.getString("user_id"));

                    p.setAmount(
                            rs.getDouble("amount"));

                    p.setPaymentMethod(
                            rs.getString("payment_method"));

                    p.setStatus(
                            rs.getString("status"));

                    p.setPaymentDate(

                            format(

                                    rs.getTimestamp(
                                            "created_date"
                                    )

                            )

                    );

                    return p;

                }

        );

    }

}
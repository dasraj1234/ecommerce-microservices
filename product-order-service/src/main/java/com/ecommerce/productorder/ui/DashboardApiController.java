package com.ecommerce.productorder.ui;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
public class DashboardApiController {

    @GetMapping("/dashboard/services")
    public Map<String,String> services() {

        Map<String,String> map =
                new HashMap<>();

        RestTemplate rest =
                new RestTemplate();

      map.put(
    "Product Order Service",
    "UP"
);

        map.put(
                "Payment Wallet Service",
                check(
                        rest,
                        "http://localhost:8083/actuator/health"
                )
        );

        return map;
    }

    private String check(
            RestTemplate rest,
            String url) {

        try {

            rest.getForObject(
                    url,
                    String.class
            );

            return "UP";

        } catch(Exception e) {

            return "DOWN";
        }
    }
}
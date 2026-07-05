
package com.ecommerce.productorder.order.controller;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
@RestController
@RequestMapping("/service-status")
public class ServiceStatusController {

    @GetMapping
    public Map<String,String> getStatus() {

        Map<String,String> status =
                new HashMap<>();

        status.put(
                "apiGateway",
                isUp("http://localhost:8080/actuator/health")
                        ? "RUNNING"
                        : "DOWN"
        );

        status.put(
                "authUser",
                isUp("http://localhost:8081/actuator/health")
                        ? "RUNNING"
                        : "DOWN"
        );

        status.put(
                "paymentWallet",
                isUp("http://localhost:8083/actuator/health")
                        ? "RUNNING"
                        : "DOWN"
        );

        return status;
    }

    private boolean isUp(String url) {

        try {

            RestTemplate restTemplate =
                    new RestTemplate();

            ResponseEntity<String> response =
                    restTemplate.getForEntity(
                            url,
                            String.class
                    );

            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception ex) {

            return false;
        }
    }
}
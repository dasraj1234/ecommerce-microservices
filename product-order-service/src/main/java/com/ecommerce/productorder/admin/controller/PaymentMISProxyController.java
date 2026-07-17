package com.ecommerce.productorder.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/admin/payments")
public class PaymentMISProxyController {

    private final RestTemplate restTemplate;

    public PaymentMISProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/mis")
    public ResponseEntity<String> getMIS(

            @RequestParam String fromDate,
            @RequestParam String toDate,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "ALL") String paymentMethod) {

        String url =
                "http://localhost:8083/admin/payments/mis"
                        + "?fromDate=" + fromDate
                        + "&toDate=" + toDate
                        + "&status=" + status
                        + "&paymentMethod=" + paymentMethod;

        return ResponseEntity.ok(
                restTemplate.getForObject(url, String.class)
        );
    }

    @GetMapping("/mis/download")
    public ResponseEntity<byte[]> download(

            @RequestParam String fromDate,
            @RequestParam String toDate,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "ALL") String paymentMethod) {

        String url =
                "http://localhost:8083/admin/payments/mis/download"
                        + "?fromDate=" + fromDate
                        + "&toDate=" + toDate
                        + "&status=" + status
                        + "&paymentMethod=" + paymentMethod;

        return restTemplate.getForEntity(
                url,
                byte[].class
        );
    }
}
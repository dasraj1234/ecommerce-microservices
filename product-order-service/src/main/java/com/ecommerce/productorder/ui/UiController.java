package com.ecommerce.productorder.ui;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UiController {

    @GetMapping("/")
    public String landing() {
        return "landing";
    }

    // ---------- ADMIN ----------

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "admin/dashboard";
    }

    @GetMapping("/admin/products")
    public String adminProducts() {
        return "admin/products";
    }

    @GetMapping("/admin/orders")
    public String adminOrders() {
        return "admin/orders";
    }

    @GetMapping("/admin/payments")
    public String adminPayments() {
        return "admin/payments";
    }

    // ---------- CUSTOMER ----------

    @GetMapping("/customer/home")
    public String customerHome() {
        return "customer/home";
    }

    @GetMapping("/customer/orders")
    public String customerOrders() {
        return "customer/orders";
    }

    @GetMapping("/customer/payments")
    public String customerPayments() {
        return "customer/payments";
    }

    @GetMapping("/customer/wallet")
    public String customerWallet() {
        return "customer/wallet";
    }
}
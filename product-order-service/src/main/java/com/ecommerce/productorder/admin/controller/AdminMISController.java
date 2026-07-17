package com.ecommerce.productorder.admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;



@Controller
@RequestMapping("/admin")
public class AdminMISController {

    @GetMapping("/payment-mis")
    public String paymentMIS() {

        return "admin/payment-mis";

    }

}


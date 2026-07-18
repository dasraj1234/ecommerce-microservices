package com.ecommerce.productorder.stats.controller;

import com.ecommerce.productorder.stats.repository.OrderStatsRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders/stats")
@CrossOrigin
public class OrderStatsController {

    private final OrderStatsRepository repo;

    public OrderStatsController(OrderStatsRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/top-products")
    public List<Map<String, Object>> topProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return repo.topProducts(limit);
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> byCategory() {
        return repo.byCategory();
    }

    @GetMapping("/price-ranges")
    public List<Map<String, Object>> byPriceRange() {
        return repo.byPriceRange();
    }

    @GetMapping("/monthly")
    public List<Map<String, Object>> monthly() {
        return repo.monthly();
    }

    @GetMapping("/mis")
    public List<Map<String, Object>> mis() {
        return repo.mis();
    }
}

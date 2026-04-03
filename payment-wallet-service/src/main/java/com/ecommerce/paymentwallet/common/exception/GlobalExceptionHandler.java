package com.ecommerce.paymentwallet.common.exception;

import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException; // 🔥 ADD THIS

import java.util.HashMap;
import java.util.Map;
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 🔥 400 - Bad Request
    @ExceptionHandler(BadRequestException.class)
    public Map<String, Object> handleBadRequest(BadRequestException ex) {

        Map<String, Object> res = new HashMap<>();
        res.put("status", "FAILED");
        res.put("message", ex.getMessage());

        return res;
    }

    // 🔥 404 - Not Found
    @ExceptionHandler(ResourceNotFoundException.class)
    public Map<String, Object> handleNotFound(ResourceNotFoundException ex) {

        Map<String, Object> res = new HashMap<>();
        res.put("status", "FAILED");
        res.put("message", ex.getMessage());

        return res;
    }

    // 🔥 500 - Generic fallback
    @ExceptionHandler(Exception.class)
    public Map<String, Object> handleGeneric(Exception ex) {

        Map<String, Object> res = new HashMap<>();
        res.put("status", "FAILED");
        res.put("message", "Something went wrong");

        return res;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
public Map<String, Object> handleDB(DataIntegrityViolationException ex) {

    Map<String, Object> res = new HashMap<>();
    res.put("status", "FAILED");

    if (ex.getMessage().contains("order_id")) {
        res.put("message", "Order ID is required");
    } else {
        res.put("message", "Database error");
    }

    return res;
}


}
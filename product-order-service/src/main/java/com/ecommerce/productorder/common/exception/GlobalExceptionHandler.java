package com.ecommerce.productorder.common.exception;

import com.ecommerce.productorder.common.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({
            ProductNotFoundException.class,
            OrderNotFoundException.class
    })
    public ResponseEntity<ApiResponse<Object>> handleNotFound(RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.failure(ex.getMessage()));
                
    }

    @ExceptionHandler({
            InsufficientStockException.class,
            IllegalStateException.class,
            MethodArgumentNotValidException.class
    })
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(Exception ex) {

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.failure(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
public ApiResponse<String> handleIllegalArgument(
        IllegalArgumentException ex) {

    return ApiResponse.failure(
            ex.getMessage()
    );
}

@ExceptionHandler(ResourceNotFoundException.class)
public ApiResponse<String> handleResourceNotFound(
        ResourceNotFoundException ex) {

    return ApiResponse.failure(
            ex.getMessage()
    );
}
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handle(Exception ex) {
            ex.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure("Something went wrong"));
    }

    @ExceptionHandler(
    org.springframework.web.servlet.resource.NoResourceFoundException.class
)
@ResponseStatus(HttpStatus.NOT_FOUND)
public void ignoreFavicon() {
}


}

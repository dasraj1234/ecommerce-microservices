package com.ecommerce.productorder.common.exception;

public class ResourceNotFoundException
        extends RuntimeException {

    public ResourceNotFoundException(
            String message) {

        super(message);

    }

}
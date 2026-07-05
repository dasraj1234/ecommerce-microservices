package com.ecommerce.productorder.order.dto;

public class OrderRequest {

    private String userId;

    private String productId;

    private Integer quantity;

    private Double totalAmount;

    private String paymentMethod; //razorpay integration 12th june

    private String paymentId;  //inconsistency fixed on 13th june

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }


    //razorpay integration 12th june
    public String getPaymentMethod() {
    return paymentMethod;
}

public void setPaymentMethod(String paymentMethod) {
    this.paymentMethod = paymentMethod;
}

public String getPaymentId() {
    return paymentId;
}

public void setPaymentId(String paymentId) {
    this.paymentId = paymentId;
}
//razorpay integration 12th june
}
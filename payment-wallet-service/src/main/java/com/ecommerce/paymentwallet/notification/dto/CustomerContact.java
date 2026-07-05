//email smtp implemented.
package com.ecommerce.paymentwallet.notification.dto;

public class CustomerContact {

    private String userId;

    private String customerName;

    private String email;

    private String mobileNumber;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(
            String customerName) {
        this.customerName = customerName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email) {
        this.email = email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(
            String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
}
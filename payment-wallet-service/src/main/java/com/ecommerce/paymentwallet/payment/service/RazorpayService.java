//razorpay integration 12th june

package com.ecommerce.paymentwallet.payment.service;

import com.ecommerce.paymentwallet.payment.dto.RazorpayCreateOrderRequest;
import com.ecommerce.paymentwallet.payment.dto.RazorpayOrderResponse;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;

import lombok.RequiredArgsConstructor;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ecommerce.paymentwallet.payment.repository.PaymentRepository; //added for verify payment api - razorpay integration 12th june
import com.ecommerce.paymentwallet.payment.repository.PaymentLogRepository;
import com.ecommerce.paymentwallet.common.util.IdGenerator; //added for verify payment api - razorpay integration 12th june
import com.ecommerce.paymentwallet.common.util.JsonUtil;
import com.ecommerce.paymentwallet.notification.dto.CustomerContact;
import com.ecommerce.paymentwallet.notification.service.CustomerContactService;
import com.ecommerce.paymentwallet.notification.service.NotificationService;
import com.razorpay.Utils; //added for verify payment api - razorpay integration 12th june
import com.ecommerce.paymentwallet.payment.dto.RazorpayVerifyRequest; //added for verify payment api - razorpay integration
// 12th june



@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final RazorpayClient razorpayClient;

    private final PaymentRepository paymentRepository;

    private final PaymentLogRepository logRepository;

    private final IdGenerator idGenerator;

    private final CustomerContactService customerContactService;

    private final NotificationService notificationService;

    
    @Value("${razorpay.key.id}")
    private String keyId;

    public RazorpayOrderResponse createOrder(
            RazorpayCreateOrderRequest request)
            throws Exception {

        JSONObject options =
                new JSONObject();

        options.put(
                "amount",
                request.getAmount() * 100
        );

        options.put(
                "currency",
                "INR"
        );

        options.put(
                "receipt",
                request.getOrderId()
        );

        System.out.println("OUR ORDER ID = " + request.getOrderId());
        Order order =
                razorpayClient.orders.create(options);

       return new RazorpayOrderResponse(

        order.get("id").toString(),        // Razorpay Order ID

        request.getOrderId(),   // OUR Order ID

        keyId,

        request.getAmount(),

        "INR"

);
    }


//create verify api - razorpay integration 12th june
@Value("${razorpay.key.secret}")
private String keySecret;

public String verifyPayment(
        RazorpayVerifyRequest request)
        throws Exception {

//razorpay integration 12th june
                System.out.println(
    "VERIFY API HIT"
);

System.out.println(
    "USER ID = " +
    request.getUserId()
);

System.out.println(
    "ORDER ID = " +
    request.getOrderId()
);

System.out.println(
    "RAZORPAY ORDER = " +
    request.getRazorpayOrderId()
);


System.out.println(
    "PAYMENT ID = " +
    request.getRazorpayPaymentId()
);

System.out.println(
    "SIGNATURE = " +
    request.getRazorpaySignature()
);

//razorpay integration 12th june

    JSONObject attributes =
            new JSONObject();

    attributes.put(
            "razorpay_order_id",
            request.getRazorpayOrderId()
    );

    attributes.put(
            "razorpay_payment_id",
            request.getRazorpayPaymentId()
    );

    attributes.put(
            "razorpay_signature",
            request.getRazorpaySignature()
    );

   boolean verified;

try {

    verified =
        Utils.verifyPaymentSignature(
                attributes,
                keySecret
        );

    System.out.println(
        "VERIFY RESULT = " +
        verified
    );

} catch (Exception ex) {

    System.out.println(
        "VERIFY EXCEPTION OCCURRED"
    );

    ex.printStackTrace();

    verified = false;
}

//razorpay integration 12th june
if (verified) {

    try {

        System.out.println("ENTERING DB SAVE");

        String paymentId =
                idGenerator.generatePaymentId();

        System.out.println(
                "GENERATED PAYMENT ID = " +
                paymentId
        );

    paymentRepository.saveRazorpayPayment(

        paymentId,
        request.getOrderId(),
        request.getUserId(),
        request.getAmount(),
        request.getIdempotencyKey(),
        request.getRazorpayOrderId(),
        request.getRazorpayPaymentId(),
        request.getRazorpaySignature()
);

System.out.println(
        "PAYMENT SAVED TO DB"
);

logRepository.log(
        paymentId,
        JsonUtil.toJson(request),
        "{\"status\":\"SUCCESS\",\"paymentId\":\"" + paymentId + "\"}",
        "SUCCESS",
        "RAZORPAY_VERIFIED"
);

try {

      System.out.println("BEFORE CUSTOMER LOOKUP");

    new Thread(() -> {

    try {

        CustomerContact customer =
                customerContactService.findByUserId(
                        request.getUserId()
                );

        notificationService.sendPaymentSuccessMail(
                customer.getEmail(),
                customer.getCustomerName(),
                paymentId,
                request.getAmount()
        );

        System.out.println("EMAIL SENT");

    } catch (Exception ex) {

        System.out.println("EMAIL FAILED");

        ex.printStackTrace();
    }

}).start();


    System.out.println(
            "EMAIL SENT"  //email smtp implemented.

    );

} catch (Exception ex) {

    System.out.println(
            "EMAIL FAILED"   //email smtp implemented.

    );

    ex.printStackTrace();
}

return paymentId;   // IMPORTANT

    } catch (Exception ex) {

        System.out.println(
                "DB SAVE FAILED"
        );

        ex.printStackTrace();

        return null;
    }
}

// Signature verification failed — log it
logRepository.log(
        request.getRazorpayPaymentId(),
        JsonUtil.toJson(request),
        "{\"status\":\"FAILED\"}",
        "FAILED",
        "SIGNATURE_MISMATCH"
);

return null;

}

}
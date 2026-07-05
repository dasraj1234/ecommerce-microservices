package com.ecommerce.paymentwallet.payment.controller;
import java.util.List;
import com.ecommerce.paymentwallet.payment.dto.PaymentDetailsResponse;
import com.ecommerce.paymentwallet.payment.dto.PaymentRequest;
import com.ecommerce.paymentwallet.payment.dto.PaymentResponse;
import com.ecommerce.paymentwallet.payment.service.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

//razorpay integration 12th june
import com.ecommerce.paymentwallet.payment.dto.RazorpayVerifyRequest;
import com.ecommerce.paymentwallet.payment.dto.RazorpayCreateOrderRequest;
import com.ecommerce.paymentwallet.payment.dto.RazorpayOrderResponse;
import com.ecommerce.paymentwallet.payment.service.RazorpayService;


@Tag(
    name = "Payment APIs",
    description = "Payment processing and payment history operations"
)


@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor

public class PaymentController {

    private final PaymentService paymentService;
    private final RazorpayService razorpayService; //razorpay integration 12th june


    @Operation(summary = "Process payment")
    @PostMapping("/process")
    public PaymentResponse process(
            @RequestBody PaymentRequest request) {

        return paymentService.processPayment(request);
    }

    @Operation(summary = "Get payment details by payment ID")
    @GetMapping("/{paymentId}")
public PaymentDetailsResponse getPayment(
        @PathVariable String paymentId) {

    return paymentService.getPayment(
            paymentId
    );
}

@Operation(summary = "Get payment history by user")
@CrossOrigin(origins = "http://localhost:8082")
@GetMapping("/user/{userId}")
public List<PaymentDetailsResponse> getPaymentsByUser(
        @PathVariable String userId) {

    return paymentService.getPaymentsByUser(
            userId
    );
}


//razorpay integration 12th june
@Operation(summary = "Create Razorpay Order")
@PostMapping("/razorpay/create-order")
public RazorpayOrderResponse createRazorpayOrder(
        @RequestBody RazorpayCreateOrderRequest request)
        throws Exception {

    return razorpayService.createOrder(request);
}


//create verify api - razorpay integration 12th june
@PostMapping("/razorpay/verify")
public PaymentResponse verifyPayment(
        @RequestBody
        RazorpayVerifyRequest request)
        throws Exception {

                   System.out.println(
        "REQUEST AMOUNT = "
        + request.getAmount()
    );

    System.out.println(
        "REQUEST IDEMPOTENCY = "
        + request.getIdempotencyKey()
    );

    //improvements 14th june

    String paymentId =
            razorpayService.verifyPayment(
                    request
            );

   if (paymentId != null) {

     PaymentResponse response =
        new PaymentResponse();
//improvements 14th june
response.setPaymentId(paymentId);
response.setStatus("SUCCESS");
response.setMessage(
        "Payment verified successfully"
);

return response;
    }
//improvements 14th june
    PaymentResponse response =
        new PaymentResponse();

response.setPaymentId(
        request.getRazorpayPaymentId()
);
//improvements 14th june
response.setStatus("FAILED");
response.setMessage(
        "Signature verification failed"
);

return response;
}

}
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

// encryption module
import com.ecommerce.paymentwallet.common.crypto.CryptoService;
import com.ecommerce.paymentwallet.common.crypto.EncryptedRequest;
import com.fasterxml.jackson.databind.ObjectMapper;


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
    private final CryptoService cryptoService;
    private final ObjectMapper objectMapper;


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


// ── Encrypted endpoint variants ───────────────────────────────────────────────
// Each /secure endpoint decrypts the incoming EncryptedRequest, delegates to the
// same service layer as the plaintext endpoint, then returns an encrypted response.
// The caller's AES-256 session key (RSA-wrapped in encryptedKey) is reused for
// the response so the client can decrypt with the same key it generated.

@Operation(summary = "Process wallet payment (encrypted)")
@PostMapping("/process/secure")
public EncryptedRequest processSecure(
        @RequestBody EncryptedRequest encrypted) throws Exception {

    byte[] aesKey = cryptoService.extractAesKey(encrypted.getEncryptedKey());
    String json   = cryptoService.decryptPayload(
            encrypted.getPayload(), encrypted.getIv(), aesKey);

    PaymentRequest request  = objectMapper.readValue(json, PaymentRequest.class);
    PaymentResponse response = paymentService.processPayment(request);

    return cryptoService.encryptResponseWithKey(
            objectMapper.writeValueAsString(response), aesKey);
}

@Operation(summary = "Create Razorpay order (encrypted)")
@PostMapping("/razorpay/create-order/secure")
public EncryptedRequest createRazorpayOrderSecure(
        @RequestBody EncryptedRequest encrypted) throws Exception {

    byte[] aesKey = cryptoService.extractAesKey(encrypted.getEncryptedKey());
    String json   = cryptoService.decryptPayload(
            encrypted.getPayload(), encrypted.getIv(), aesKey);

    RazorpayCreateOrderRequest request  = objectMapper.readValue(json, RazorpayCreateOrderRequest.class);
    RazorpayOrderResponse      response = razorpayService.createOrder(request);

    return cryptoService.encryptResponseWithKey(
            objectMapper.writeValueAsString(response), aesKey);
}

@Operation(summary = "Verify Razorpay payment (encrypted)")
@PostMapping("/razorpay/verify/secure")
public EncryptedRequest verifyPaymentSecure(
        @RequestBody EncryptedRequest encrypted) throws Exception {

    byte[] aesKey = cryptoService.extractAesKey(encrypted.getEncryptedKey());
    String json   = cryptoService.decryptPayload(
            encrypted.getPayload(), encrypted.getIv(), aesKey);

    RazorpayVerifyRequest request   = objectMapper.readValue(json, RazorpayVerifyRequest.class);
    String               paymentId  = razorpayService.verifyPayment(request);
    PaymentResponse      response   = buildVerifyResponse(paymentId, request.getRazorpayPaymentId());

    return cryptoService.encryptResponseWithKey(
            objectMapper.writeValueAsString(response), aesKey);
}

private PaymentResponse buildVerifyResponse(String paymentId, String razorpayPaymentId) {
    PaymentResponse response = new PaymentResponse();
    if (paymentId != null) {
        response.setPaymentId(paymentId);
        response.setStatus("SUCCESS");
        response.setMessage("Payment verified successfully");
    } else {
        response.setPaymentId(razorpayPaymentId);
        response.setStatus("FAILED");
        response.setMessage("Signature verification failed");
    }
    return response;
}

}
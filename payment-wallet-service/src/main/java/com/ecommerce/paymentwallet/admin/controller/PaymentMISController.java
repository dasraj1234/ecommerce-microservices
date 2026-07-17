package com.ecommerce.paymentwallet.admin.controller;

import com.ecommerce.paymentwallet.admin.dto.PaymentMISResponse;
import com.ecommerce.paymentwallet.admin.service.PaymentMISExcelService;
import com.ecommerce.paymentwallet.admin.service.PaymentMISService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
public class PaymentMISController {

    private final PaymentMISService service;

    private final PaymentMISExcelService excelService;

    @GetMapping("/mis")
public List<PaymentMISResponse> getMIS(

    @RequestParam(required = false) String fromDate,

    @RequestParam(required = false) String toDate,

    @RequestParam(defaultValue = "ALL") String status,

    @RequestParam(defaultValue = "ALL") String paymentMethod

){
    if (fromDate == null) {
        fromDate = "2000-01-01";
    }

    if (toDate == null) {
        toDate = LocalDate.now().toString();
    }

    return service.getMIS(fromDate, toDate, status, paymentMethod);
}

@GetMapping("/mis/download")
public ResponseEntity<byte[]> download(

        @RequestParam String fromDate,

        @RequestParam String toDate,

        @RequestParam(defaultValue="ALL")
        String status,

        @RequestParam(defaultValue="ALL")
        String paymentMethod

) throws Exception{

    byte[] file =

            excelService.export(

                    fromDate,

                    toDate,

                    status,

                    paymentMethod

            );

    return ResponseEntity.ok()

            .header(

                    HttpHeaders.CONTENT_DISPOSITION,

                    "attachment; filename=Payment_MIS.xlsx"

            )

            .contentType(

                    MediaType.APPLICATION_OCTET_STREAM

            )

            .body(file);

}

}
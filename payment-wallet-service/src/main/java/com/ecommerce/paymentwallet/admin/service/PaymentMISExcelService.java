package com.ecommerce.paymentwallet.admin.service;

import com.ecommerce.paymentwallet.admin.dto.PaymentMISResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentMISExcelService {

    private final PaymentMISService paymentMISService;

    public byte[] export(

            String fromDate,

            String toDate,

            String status,

            String paymentMethod

    ) throws Exception {

        List<PaymentMISResponse> list =

                paymentMISService.getMIS(

                        fromDate,

                        toDate,

                        status,

                        paymentMethod

                );

        Workbook workbook =

                new XSSFWorkbook();

        Sheet sheet =

                workbook.createSheet(

                        "Payment MIS"

                );

        Font headerFont =
                workbook.createFont();

        headerFont.setBold(true);

        CellStyle headerStyle =
                workbook.createCellStyle();

        headerStyle.setFont(headerFont);

        headerStyle.setFillForegroundColor(

                IndexedColors.LIGHT_BLUE.getIndex()

        );

        headerStyle.setFillPattern(

                FillPatternType.SOLID_FOREGROUND

        );

        Row title =
                sheet.createRow(0);

        title.createCell(0)
                .setCellValue("Payment MIS Report");

        Row filter =
                sheet.createRow(1);

        filter.createCell(0)
                .setCellValue("From");

        filter.createCell(1)
                .setCellValue(fromDate);

        filter.createCell(2)
                .setCellValue("To");

        filter.createCell(3)
                .setCellValue(toDate);

        filter.createCell(4)
                .setCellValue("Status");

        filter.createCell(5)
                .setCellValue(status);

        filter.createCell(6)
                .setCellValue("Method");

        filter.createCell(7)
                .setCellValue(paymentMethod);

        Row header =
                sheet.createRow(3);

        String[] cols = {

                "Payment ID",

                "Order ID",

                "User ID",

                "Amount",

                "Method",

                "Status",

                "Payment Date"

        };

        for(int i=0;i<cols.length;i++){

            Cell cell=
                    header.createCell(i);

            cell.setCellValue(cols[i]);

            cell.setCellStyle(headerStyle);

        }

        int row=4;

        for(PaymentMISResponse p:list){

            Row r=
                    sheet.createRow(row++);

            r.createCell(0)
                    .setCellValue(
                            p.getPaymentId()
                    );

            r.createCell(1)
                    .setCellValue(
                            p.getOrderId()
                    );

            r.createCell(2)
                    .setCellValue(
                            p.getUserId()
                    );

            r.createCell(3)
                    .setCellValue(
                            p.getAmount()
                    );

            r.createCell(4)
                    .setCellValue(
                            p.getPaymentMethod()
                    );

            r.createCell(5)
                    .setCellValue(
                            p.getStatus()
                    );

            r.createCell(6)
                    .setCellValue(
                            p.getPaymentDate()
                    );

        }

        for(int i=0;i<7;i++){

            sheet.autoSizeColumn(i);

        }

        ByteArrayOutputStream out =
                new ByteArrayOutputStream();

        workbook.write(out);

        workbook.close();

        return out.toByteArray();

    }

}
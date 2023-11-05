package com.product.emailsender.emailsender;

import java.io.File;
import java.text.DateFormat;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.product.emailsender.emailsender.models.Bill;
import com.product.emailsender.emailsender.services.EmailService;
import com.product.emailsender.emailsender.services.PDFService;
import com.product.emailsender.emailsender.util.Gson_InstantTypeAdapter;

@Service
public class Receiver {

    private PDFService pdfService;
    private EmailService emailService;

    @Autowired
    public Receiver(PDFService pdfService,
                    EmailService emailService) {
        this.pdfService = pdfService;
        this.emailService = emailService;
    }

    public void receiveMessage(String message) {
        Gson gson = new GsonBuilder()
                .setDateFormat(DateFormat.FULL, DateFormat.FULL)
                .registerTypeAdapter( Instant.class , new Gson_InstantTypeAdapter()).create();

        var bill = gson.fromJson(message, Bill.class);

        File location = null;
        try {
            location = pdfService.generatePdf(bill);
        } catch (Exception e) {
            e.printStackTrace();
        }

        emailService.sendEmail(location, bill);
    }

}

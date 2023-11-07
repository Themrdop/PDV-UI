package com.product.emailsender.emailsender;

import java.io.File;
import java.text.DateFormat;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.product.emailsender.emailsender.models.Bill;
import com.product.emailsender.emailsender.models.Config;
import com.product.emailsender.emailsender.models.Recepcion;
import com.product.emailsender.emailsender.models.Enums.TipoPago;
import com.product.emailsender.emailsender.services.EmailService;
import com.product.emailsender.emailsender.services.HaciendaService;
import com.product.emailsender.emailsender.services.PDFService;
import com.product.emailsender.emailsender.util.Gson_InstantTypeAdapter;
import com.product.emailsender.emailsender.util.TipoPagoDeserializer;

@Service
public class Receiver {

    private PDFService pdfService;
    private EmailService emailService;
    private HaciendaService haciendaService;
    private Config config;

    @Autowired
    public Receiver(PDFService pdfService,
            EmailService emailService,
            HaciendaService haciendaService,
            Config config) {
        this.pdfService = pdfService;
        this.emailService = emailService;
        this.haciendaService = haciendaService;
        this.config = config;
    }

    public void receiveMessage(String message) throws Exception {
        Gson gson = new GsonBuilder()
                .setDateFormat(DateFormat.FULL, DateFormat.FULL)
                .registerTypeAdapter(Instant.class, new Gson_InstantTypeAdapter())
                .registerTypeAdapter(TipoPago.class, new TipoPagoDeserializer()).create();
        
        var bill = gson.fromJson(message, Bill.class);

        File location = pdfService.generatePdf(bill, config.getPath());
        var respuesta_xml = haciendaService.getHaciendaResponce(bill);

        var x = gson.fromJson(respuesta_xml, Recepcion.class);

        emailService.sendEmail(location, bill, Base64Decode(x.getRespuesta_xml()));
    }

    private String Base64Decode(String encodedString) {
        return new String(java.util.Base64.getDecoder().decode(encodedString));
    }

}

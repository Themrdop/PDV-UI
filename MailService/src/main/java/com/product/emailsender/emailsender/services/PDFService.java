package com.product.emailsender.emailsender.services;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.layout.SharedContext;
import org.xhtmlrenderer.pdf.ITextRenderer;
import org.jsoup.nodes.Document;

import com.github.jknack.handlebars.Handlebars;
import com.github.jknack.handlebars.Template;
import com.product.emailsender.emailsender.models.Bill;
import com.product.emailsender.emailsender.models.Invoice;
import com.product.emailsender.emailsender.models.Enums.TipoPago;
import com.product.emailsender.emailsender.util.CustomElementFactoryImpl;

@Service
public class PDFService {

    public File generatePdf(Bill bill, String outputPdf) throws Exception {
        return generateHtmlToPdf(bill, outputPdf);
    }

    private static final String HTML_INPUT = "/Users/andrewallen/Code/PDV-UI/MailService/src/main/resources/static/invoice.html";

    private File generateHtmlToPdf(Bill bill, String outputPdfPath) throws Exception {
        File inputHTML = new File(HTML_INPUT);
        Document inputHtml = createWellFormedHtml(inputHTML);
        File outputPdf = new File(outputPdfPath + bill.getElectronicBill().getClave() + "_Recibo.pdf");
        xhtmlToPdf(inputHtml, outputPdf, bill);
        return outputPdf;
    }

    private Document createWellFormedHtml(File inputHTML) throws IOException {
        Document document = Jsoup.parse(inputHTML, "UTF-8");

        document.outputSettings()
                .syntax(Document.OutputSettings.Syntax.xml);
        return document;
    }

    private void xhtmlToPdf(Document xhtml, File outputPdf, Bill bill) throws Exception {
        try (OutputStream outputStream = new FileOutputStream(outputPdf)) {
            ITextRenderer renderer = new ITextRenderer();
            SharedContext sharedContext = renderer.getSharedContext();
            sharedContext.setPrint(true);
            sharedContext.setInteractive(false);
            sharedContext.setReplacedElementFactory(new CustomElementFactoryImpl());
            String HTMLWitData = addDataToTemplate(xhtml.html(), bill);
            renderer.setDocumentFromString(HTMLWitData);
            renderer.layout();
            renderer.createPDF(outputStream);
        }
    }

    private String addDataToTemplate(String html, Bill bill) throws IOException {
        Handlebars handlebars = new Handlebars();
        Template template = handlebars.compileInline(html);
        String metodoPago = getMetodoPago(bill.getMedioPago().get(0));
        Invoice invoice = new Invoice(bill.getConsecutive(), bill.getDate(), bill.getElectronicBill().getComers().getName(),
                bill.getElectronicBill().getComers().getAddress(), bill.getElectronicBill().getComers().getPhone(), bill.getElectronicBill().getComers().getEmail(),
                bill.getElectronicBill().getRecipient().getName(), bill.getElectronicBill().getRecipient().getEmail(), metodoPago,
                bill.getProducts().size(), bill.getProducts().get(0).getPrice(), bill.getProducts(),
                bill.getTotal());

        return template.apply(invoice);
    }

    private String getMetodoPago(TipoPago tipoPago) {
        return switch (tipoPago) {
            case Transferencia_DepositoBancario -> "Transferencia o Deposito Bancario";
            case Tarjeta -> "Tarjeta";
            case Efectivo -> "Efectivo";
        };
    }
}

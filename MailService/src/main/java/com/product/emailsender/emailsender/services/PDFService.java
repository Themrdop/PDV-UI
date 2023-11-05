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

import com.product.emailsender.emailsender.models.Bill;
import com.product.emailsender.emailsender.util.CustomElementFactoryImpl;

@Service
public class PDFService {

    public File generatePdf(Bill bill) throws Exception {
        return generateHtmlToPdf();
    }

    private static final String HTML_INPUT = "/Users/andrewallen/Code/PDV-UI/MailService/src/main/resources/static/invoice.html";
    private static final String PDF_OUTPUT = "/Users/andrewallen/Code/PDV-UI/MailService/src/main/resources/static/";

    private File generateHtmlToPdf() throws Exception {
        File inputHTML = new File(HTML_INPUT);
        Document inputHtml = createWellFormedHtml(inputHTML);
        File outputPdf = new File(PDF_OUTPUT+"invoice.pdf");
        xhtmlToPdf(inputHtml, outputPdf);
        return outputPdf;
    }

    private Document createWellFormedHtml(File inputHTML) throws IOException {
        Document document = Jsoup.parse(inputHTML, "UTF-8");
        document.outputSettings()
            .syntax(Document.OutputSettings.Syntax.xml);
        return document;
    }

    private void xhtmlToPdf(Document xhtml, File outputPdf) throws Exception {
        try (OutputStream outputStream = new FileOutputStream(outputPdf)) {
            ITextRenderer renderer = new ITextRenderer();
            SharedContext sharedContext = renderer.getSharedContext();
            sharedContext.setPrint(true);
            sharedContext.setInteractive(false);
            sharedContext.setReplacedElementFactory(new CustomElementFactoryImpl());
            renderer.setDocumentFromString(xhtml.html());
            renderer.layout();
            renderer.createPDF(outputStream);
        }
    }
}

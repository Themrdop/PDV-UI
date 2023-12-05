package com.product.emailsender.emailsender.services;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;

import org.springframework.stereotype.Service;

import com.product.emailsender.emailsender.models.Bill;

@Service
public class EmailService {

    private final String smtpHostServer = "smtp.gmail.com";
    private final String emailID = "takeout.cr";
    private final String subject = "Factura electrónica";
    private final String body = "Adjunto encontrará su factura electrónica.";

    public boolean sendEmail(File location, Bill bill, String xmlResponse) {
        Properties props = System.getProperties();

        props.put("mail.smtp.host", smtpHostServer);
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true"); // TLS

        Session session = Session.getInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(emailID, "batr cqrq ehbx haan");
                    }
                });

        try {
            MimeMessage msg = new MimeMessage(session);
            msg.addHeader("Content-type", "text/HTML; charset=UTF-8");
            msg.addHeader("format", "flowed");
            msg.addHeader("Content-Transfer-Encoding", "8bit");

            msg.setFrom(new InternetAddress(emailID, "Takeout"));

            msg.setReplyTo(InternetAddress.parse(emailID, false));

            msg.setSubject(subject, "UTF-8");

            msg.setSentDate(new Date());

            msg.setRecipients(Message.RecipientType.TO,
                    InternetAddress.parse(bill.getElectronicBill().getRecipient().getEmail(), false));

            // Create the message body part
            BodyPart messageBodyPart = new MimeBodyPart();

            // Fill the message
            messageBodyPart.setText(body);

            // Create a multipart message for attachment
            Multipart multipart = new MimeMultipart();

            // Set text message part
            multipart.addBodyPart(messageBodyPart);

            // Second part is attachment
            messageBodyPart = new MimeBodyPart();
            DataSource source = new FileDataSource(location.getAbsolutePath());
            messageBodyPart.setDataHandler(new DataHandler(source));
            messageBodyPart.setFileName(location.getAbsolutePath());
            multipart.addBodyPart(messageBodyPart);

            messageBodyPart = new MimeBodyPart();
            DataSource attachment = new ByteArrayDataSource(bill.getElectronicBill()
                    .getElectronicBill()
                    .getBytes("utf-8"), "text/plain");
            messageBodyPart.setDataHandler(new DataHandler(attachment));
            messageBodyPart.setFileName(bill.getElectronicBill().getClave() + ".xml");
            multipart.addBodyPart(messageBodyPart);

            if (xmlResponse != null) {
                messageBodyPart = new MimeBodyPart();
                DataSource attachment2 = new ByteArrayDataSource(xmlResponse.getBytes("utf-8"), "text/plain");
                messageBodyPart.setDataHandler(new DataHandler(attachment2));
                messageBodyPart.setFileName(bill.getElectronicBill().getClave() + "_Respuesta" + ".xml");
                multipart.addBodyPart(messageBodyPart);
            }

            // Send the complete message parts
            msg.setContent(multipart);

            // Send message
            Transport.send(msg);

            return true;
        } catch (MessagingException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        return false;
    }
}



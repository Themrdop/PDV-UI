package com.product.emailsender.emailsender.util;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.w3c.dom.Element;
import org.xhtmlrenderer.extend.FSImage;
import org.xhtmlrenderer.extend.ReplacedElement;
import org.xhtmlrenderer.extend.ReplacedElementFactory;
import org.xhtmlrenderer.extend.UserAgentCallback;
import org.xhtmlrenderer.layout.LayoutContext;
import org.xhtmlrenderer.pdf.ITextFSImage;
import org.xhtmlrenderer.pdf.ITextImageElement;
import org.xhtmlrenderer.render.BlockBox;
import org.xhtmlrenderer.simple.extend.FormSubmissionListener;

import com.google.gson.Gson;
import com.lowagie.text.Image;
import com.product.emailsender.emailsender.models.CommerceInformation;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Configuration
@ConfigurationProperties("api")
@NoArgsConstructor
public class CustomElementFactoryImpl implements ReplacedElementFactory {

    private String baseURL;

    @Override
    public ReplacedElement createReplacedElement(LayoutContext lc, BlockBox box, UserAgentCallback uac, int cssWidth,
            int cssHeight) {
        Element e = box.getElement();
        String nodeName = e.getNodeName();
        if (nodeName.equals("img")) {
            try {
                InputStream input = getLogoStream();
                byte[] bytes = null;
                try {
                    bytes = input.readAllBytes();
                } catch (Exception e1) {
                    e1.printStackTrace();
                } finally {
                    input.close();
                }

                Image image = Image.getInstance(bytes);
                FSImage fsImage = new ITextFSImage(image);
                if (cssWidth != -1 || cssHeight != -1) {
                    fsImage.scale(cssWidth, cssHeight);
                } else {
                    fsImage.scale(2000, 1000);
                }
                return new ITextImageElement(fsImage);
            } catch (Exception e1) {
                e1.printStackTrace();
            }
        }
        return null;
    }

    private InputStream getLogoStream() throws Exception {
        String encodedCommersName = URLEncoder.encode(getCommerceName(), StandardCharsets.UTF_8.toString());
        String urlString = baseURL + "/GetLogo?commersName=" + encodedCommersName;
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        int responseCode = conn.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            return conn.getInputStream();
        } else {
            throw new Exception("Failed to get logo: HTTP error code : " + responseCode);
        }
    }

    private String getCommerceName() throws Exception {
    String urlString = baseURL + "/GetCommerceInformation";
    URL url = new URL(urlString);
    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    conn.setRequestMethod("GET");
    int responseCode = conn.getResponseCode();
    if (responseCode == HttpURLConnection.HTTP_OK) {
        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String inputLine;
        StringBuilder content = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            content.append(inputLine);
        }
        in.close();
        conn.disconnect();
        Gson gson = new Gson();
        CommerceInformation commerceInformation = gson.fromJson(content.toString(), CommerceInformation.class);
        return commerceInformation.getName();
    } else {
        throw new Exception("Failed to get commerce information: HTTP error code : " + responseCode);
    }
}

    @Override
    public void reset() {
    }

    @Override
    public void remove(Element e) {
    }

    @Override
    public void setFormSubmissionListener(FormSubmissionListener listener) {
    }
}

package com.product.emailsender.emailsender.models;

import java.math.BigDecimal;
import java.util.List;

public record Invoice(long consecutivo, String clave, 
String date, String comersName, String comersAddress, 
String comersPhone, String comersEmail, String recipientName, 
String recipientEmail, String numeroIdentificacion, String medioPago, List<Product> products, BigDecimal total) {}
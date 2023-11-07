package com.product.emailsender.emailsender.models;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record Invoice(long consecutive, 
Instant date, String comersName, String comersAddress, 
String comersPhone, String comersEmail, String recipientName, 
String recipientEmail, String medioPago, int cantidad, 
BigDecimal precio, List<Product> products, BigDecimal total) {}
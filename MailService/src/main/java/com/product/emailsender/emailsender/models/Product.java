package com.product.emailsender.emailsender.models;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

public class Product {
    private String id = "";
    private String name = "";
    private BigDecimal price = BigDecimal.ZERO;
    private String image = "";
    private int amount = 0;

    // Getters and setters...
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    @Override
    public String toString() {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "CR"));
        return "ID: " + id + ", " + name + " con precio " + currencyFormat.format(price) + " y cantidad " + amount;
    }
}

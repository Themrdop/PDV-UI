package com.product.emailsender.emailsender.models;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.google.gson.annotations.SerializedName;
import com.product.emailsender.emailsender.models.Enums.TipoPago;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Bill {
    private static final BigDecimal IVA = new BigDecimal("0.13");
    
    private BigDecimal total;
    private long consecutive;
    private Instant date;
    private List<Product> products;
    private BigDecimal tax;
    private ElectronicBill electronicBill;
    private String condicionVenta;
    private String plazoCredito;
    private BigDecimal descuento;
    @SerializedName(value = "MedioPago")
    private List<TipoPago> medioPago;
    private int numeroVoucher;
    private BigDecimal efectivo;

    public void setTotal(BigDecimal total) {
        this.tax = total.multiply(IVA);
        this.total = total;
    }

    @Override
    public String toString() {
        return String.format("Factura No. %d del %s con un total de %s", consecutive, date.toString(),
                total.toString());
    }
}
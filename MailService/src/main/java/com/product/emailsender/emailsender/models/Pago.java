package com.product.emailsender.emailsender.models;

import java.math.BigDecimal;

public class Pago {
    private TipoPago tipoPago;
    private BigDecimal monto = BigDecimal.ZERO;

    // Getters and setters...
    public TipoPago getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(TipoPago tipoPago) {
        this.tipoPago = tipoPago;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }
}

enum TipoPago {
    Transferencia_DepositoBancario,
    Tarjeta,
    Efectivo
}

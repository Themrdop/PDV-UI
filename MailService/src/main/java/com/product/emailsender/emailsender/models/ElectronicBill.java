package com.product.emailsender.emailsender.models;

import java.net.URI;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ElectronicBill {
    private String clave;
    private Person emitter;
    private Person recipient;
    private String electronicBill;
    private URI location;
    private String errorMessages;
    private CommerceInformation comers;

    @Override
    public String toString() {
        return "Factura electronica con clave " + clave + " emitida por " + emitter + " para " + recipient;
    }
}

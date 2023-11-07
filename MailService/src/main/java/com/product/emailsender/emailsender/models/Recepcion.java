package com.product.emailsender.emailsender.models;

import com.google.gson.annotations.SerializedName;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Recepcion {
    private String clave;
    private String fecha;
    @SerializedName(value = "ind-estado")
    private String ind_estado;
    @SerializedName(value = "respuesta-xml")
    private String respuesta_xml;
}

package com.product.emailsender.emailsender.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommerceInformation {
    private String name;
    private String cedula;
    private String address;
    private String phone;
    private String email;
    private String logo;
    private byte provincia;
    private byte canton;
    private byte distrito;
    private byte barrio;
}

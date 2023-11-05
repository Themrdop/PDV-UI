package com.product.emailsender.emailsender.models;

public class Person {
    public static final String TIPO_IDENTIFICACION_FISICA = "01";
    public static final String TIPO_IDENTIFICACION_JURIDICA = "02";
    public static final String DIMEX = "03";
    public static final String NITE = "04";

    private String name = "";
    private String tipoIdentificacion = TIPO_IDENTIFICACION_FISICA;
    private String numeroIdentificacion = "";
    private String phone = "";
    private String email = "";

    // Getters and setters...
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTipoIdentificacion() {
        return tipoIdentificacion;
    }

    public void setTipoIdentificacion(String tipoIdentificacion) {
        this.tipoIdentificacion = tipoIdentificacion;
    }

    public String getNumeroIdentificacion() {
        return numeroIdentificacion;
    }

    public void setNumeroIdentificacion(String numeroIdentificacion) {
        this.numeroIdentificacion = numeroIdentificacion;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

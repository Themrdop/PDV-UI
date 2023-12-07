package com.product.emailsender.emailsender.models;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Configuration
@NoArgsConstructor
@ConfigurationProperties("hacienda")
public class HaciendaConfig {
    private String username;
    private String password;
    private String jwt_endpoint;
    private String client_id;
}

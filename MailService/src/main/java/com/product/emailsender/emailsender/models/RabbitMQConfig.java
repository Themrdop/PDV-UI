package com.product.emailsender.emailsender.models;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Configuration
@NoArgsConstructor
@ConfigurationProperties("rabbitmq")
public class RabbitMQConfig {
    private String host;
}

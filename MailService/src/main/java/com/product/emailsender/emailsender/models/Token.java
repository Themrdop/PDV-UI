package com.product.emailsender.emailsender.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Token {
  private String access_token;
  private String token_type;
  private int expires_in;
  private String refresh_token;

}

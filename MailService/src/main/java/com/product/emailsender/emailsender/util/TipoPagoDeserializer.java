package com.product.emailsender.emailsender.util;

import java.io.IOException;

import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;
import com.product.emailsender.emailsender.models.Enums.TipoPago;

public class TipoPagoDeserializer extends TypeAdapter <TipoPago> {

	@Override
	public void write(JsonWriter out, TipoPago value) throws IOException {
		throw new UnsupportedOperationException("Unimplemented method 'write'");
	}

	@Override
	public TipoPago read(JsonReader in) throws IOException {
		return TipoPago.fromCode(in.nextInt());
	}

}
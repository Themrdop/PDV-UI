using System.Text.Json.Serialization;

public class HaciendaResponse
{
    public string clave { get; set; }
    public DateTime fecha { get; set; }

    [JsonPropertyName("ind-estado")]
    public string indestado { get; set; }

    [JsonPropertyName("respuesta-xml")]
    public string respuestaxml { get; set; }
}
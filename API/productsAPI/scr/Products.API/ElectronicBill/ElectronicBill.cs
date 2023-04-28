using System.Text;
using FirmaXadesNet;
using FirmaXadesNet.Signature.Parameters;
using FirmaXadesNet.Signature;
using System.Xml.Serialization;
using System.Security.Cryptography.X509Certificates;
using TiqueteElectronico;
using System.Collections.ObjectModel;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Polly;
using System.Collections.Generic;

namespace Products.API.ElectronicBill
{
  public class ElectronicBill : IElectronicBill
  {
    private const string COUNTRY_CODE = "506";
    public const string ENDPOINT = @"https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1";
    public const string JWT_ENDPOINT = @"https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token";
    public const string CODIGO_ACTIVIDAD = "552004";
    public const string CODIGO_PRODUCTO = "6332000000000";//Suministro de comida, servicio de restaurante sin mesero, con sitios para sentarse	13%

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IAsyncPolicy<HttpResponseMessage> _retryPolicy = Policy
        .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
    private readonly string _userName;
    private readonly string _password;
    private readonly string _identificationNumber;
    private readonly string _thumbprintCertificado;
    private SignatureDocument? _signatureDocument;
    private string _token;
    private IMemoryCache _cache;

    public ElectronicBill(string userName,
                          string password,
                          string identificationNumber,
                          string thumbprintCertificado,
                          IMemoryCache cache,
                          IHttpClientFactory httpClientFactory)
    {
      _userName = userName;
      _password = password;
      _identificationNumber = identificationNumber;
      _thumbprintCertificado = thumbprintCertificado;
      _cache = cache ?? throw new ArgumentNullException(nameof(cache));
      _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
    }

    public async Task<Bill> SendElectronicBill(Bill bill, CancellationToken cancellationToken)
    {
      string haciendaKey = generateKey(bill);
      string xmlDocument = GetXMLDocument(haciendaKey, bill);
      string singedXML = singXML(xmlDocument, _thumbprintCertificado);
      string singedXMLInBase64 = Base64_Encode(singedXML);
      HaciendaMessage haciendaMessage = creatMessage(haciendaKey, bill.electronicBill.emitter, bill.electronicBill.recepient, singedXMLInBase64);
      HttpResponseMessage result = await sendToHacienda(haciendaMessage, cancellationToken);

      switch (result.StatusCode)
      {
        case System.Net.HttpStatusCode.Accepted:
          bill.electronicBill.location = result.Headers.Location;
          bill.electronicBill.electronicBill = singedXML;
          bill.electronicBill.clave = haciendaKey;

          break;

        case System.Net.HttpStatusCode.BadRequest:
          bill.electronicBill.errorMessages = result.ReasonPhrase;
          throw new Exception(result.ReasonPhrase);
        default:
          break;
      }

      return bill;

    }

    private string GetXMLDocument(string haciendaKey, Bill bill)
    {
      string xmlDocument = string.Empty;
      decimal phone = decimal.TryParse(bill.electronicBill.recepient.phone, out phone) ? phone : 0;

      var msj = new TiqueteElectronico.TiqueteElectronico
      {
        Clave = haciendaKey,
        CodigoActividad = CODIGO_ACTIVIDAD,
        FechaEmision = DateTime.Now,
        NumeroConsecutivo = bill.consecutive.ToString(),
        Emisor = new EmisorType
        {
          Nombre = bill.electronicBill.emitter.name,
          Identificacion = new IdentificacionType
          {
            Tipo = bill.electronicBill.emitter,
            Numero = bill.electronicBill.emitter.numeroIdentificacion
          },
          NombreComercial = bill.electronicBill.Comers.name,
          Ubicacion = new UbicacionType
          {
            Provincia = bill.electronicBill.Comers.Provincia,
            Canton = bill.electronicBill.Comers.Canton,
            Distrito = bill.electronicBill.Comers.Distrito,
            Barrio = bill.electronicBill.Comers.Barrio,
            OtrasSenas = bill.electronicBill.Comers.address
          },
          Telefono = new TelefonoType
          {
            CodigoPais = short.Parse(COUNTRY_CODE),
            NumTelefono = decimal.Parse(bill.electronicBill.Comers.phone)
          },
          CorreoElectronico = bill.electronicBill.Comers.email,
        },
        Receptor = new ReceptorType
        {
          Nombre = bill.electronicBill.recepient.name,
          Identificacion = new IdentificacionType
          {
            Tipo = bill.electronicBill.recepient,
            Numero = bill.electronicBill.recepient.numeroIdentificacion
          },
          Telefono = new TelefonoType
          {
            CodigoPais = short.Parse(COUNTRY_CODE),
            NumTelefono = phone
          },
          CorreoElectronico = bill.electronicBill.recepient.email,
        },
        CondicionVenta = bill,
        MedioPago = (Collection<TiqueteElectronicoMedioPago>)bill,
      };

      int linea = 1;
      decimal subtotal = 0;
      decimal total = 0;
      decimal impuesto = 0;
      decimal sumaSubtotal = 0;
      decimal sumaImpuesto = 0;
      decimal sumaTotal = 0;


      foreach (var pro in bill.products)
      {
        total = pro.price * pro.amount;
        subtotal = total - (total * (bill.Descuento / 100));
        impuesto = subtotal * 0.13M;

        msj.DetalleServicio.Add(new TiqueteElectronicoDetalleServicioLineaDetalle
        {
          NumeroLinea = linea.ToString(),
          Codigo = CODIGO_ACTIVIDAD,
          Cantidad = pro.amount,
          UnidadMedida = UnidadMedidaType.Unid,
          UnidadMedidaComercial = string.Empty,
          Detalle = pro.name,
          PrecioUnitario = pro.price,
          MontoTotal = total,
          SubTotal = subtotal,
          MontoTotalLinea = subtotal,
          Impuesto = new Collection<ImpuestoType>{
            new ImpuestoType{
              Codigo = ImpuestoTypeCodigo.IVA,
              CodigoTarifa = ImpuestoTypeCodigoTarifa.Item08,
              Tarifa = 13M,
              Monto = impuesto
            }
          }
        });
        linea++;
        sumaSubtotal += subtotal;
        sumaImpuesto += impuesto;
        sumaTotal += total;
      }

      msj.ResumenFactura = new TiqueteElectronicoResumenFactura
      {
        CodigoTipoMoneda = new CodigoMonedaType
        {
          CodigoMoneda = CodigoMonedaTypeCodigoMoneda.CRC,
          TipoCambio = 1M
        },
        //TotalServGravados = bill.total,
        //TotalServExentos = bill.TotalServExentos,
        TotalMercanciasGravadas = sumaTotal,
        TotalGravado = sumaTotal,
        //TotalExento = bill.TotalExento,
        TotalVenta = sumaTotal,
        TotalDescuentos = bill.Descuento,
        TotalVentaNeta = sumaTotal - (sumaTotal * (bill.Descuento / 100)),
        TotalImpuesto = sumaImpuesto,
        TotalComprobante = sumaTotal - (sumaTotal * (bill.Descuento / 100)) + sumaImpuesto
      };

      using var stringwriter = new Utf8StringWriter();
      var serializer = new XmlSerializer(typeof(TiqueteElectronico.TiqueteElectronico));
      serializer.Serialize(stringwriter, msj);
      xmlDocument = stringwriter.ToString();

      return xmlDocument;
    }

    private class Utf8StringWriter : StringWriter
    {
      private static readonly Encoding UTF8NoBOM = new UTF8Encoding(false);
      // Use UTF8 encoding but write no BOM to the wire
      public override Encoding Encoding
      {
        get { return UTF8NoBOM; } // in real code I'll cache this encoding.
      }
    }

    private async Task<HttpResponseMessage> sendToHacienda(HaciendaMessage haciendaMessage, CancellationToken cancellationToken)
    {
      var httpClient = _httpClientFactory.CreateClient();

      string token = await getToken(cancellationToken);
      httpClient.DefaultRequestHeaders.Add("authorization", "bearer " + token);
      return await _retryPolicy.ExecuteAsync(() => httpClient.PostAsJsonAsync<HaciendaMessage>(ENDPOINT + "/recepcion", haciendaMessage, cancellationToken: cancellationToken));
    }

    private async Task<string> getToken(CancellationToken cancellationToken)
    {
      if (localStoreTokenIsValid())
      {
        _cache.TryGetValue("Token", out Token storedToken);
        return storedToken.access_token;
      }

      var httpClient = _httpClientFactory.CreateClient();

      Dictionary<string, string> values = new();
      values.Add("client_id", "api-stag");
      values.Add("grant_type", "password");
      values.Add("username", _userName);
      values.Add("password", _password);

      var content = new FormUrlEncodedContent(values);
      var response = await _retryPolicy.ExecuteAsync(() => httpClient.PostAsync(JWT_ENDPOINT, content));
      var responseString = await response.Content.ReadAsStringAsync();

      if ((response.StatusCode != System.Net.HttpStatusCode.OK))
      {
          throw new Exception(("Error: " + responseString));
      }

      var token = JsonSerializer.Deserialize<Token>(responseString);
      saveToken(token);
      return token?.access_token ?? string.Empty;
    }

    private void saveToken(Token? token)
    {
      var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromSeconds(60))
                    .SetAbsoluteExpiration(TimeSpan.FromSeconds(3600))
                    .SetPriority(CacheItemPriority.Normal)
                    .SetSize(1024);

      _cache.Set("Token", token, cacheEntryOptions);
    }

    private bool localStoreTokenIsValid()
    {
      if (_cache.TryGetValue("Token", out Token storedToken))
      {
        return DateTimeOffset.FromUnixTimeSeconds(storedToken.expires_in).UtcDateTime > DateTime.UtcNow;
      }
      return false;
    }

    private string singXML(string xmlDoc, string thumbprintCertificado)
    {
      X509Certificate2? cert = null;

      if (string.IsNullOrEmpty(thumbprintCertificado))
      {
        cert = new X509Certificate2(Environment.CurrentDirectory + "/client-identity.p12", "123456789");
      }
      else
      {
        cert = GetCertificateByThumbprint(thumbprintCertificado);
      }

      XadesService xadesService = new XadesService();
      SignatureParameters parametros = new SignatureParameters();

      parametros.SignaturePolicyInfo = new SignaturePolicyInfo();
      parametros.SignaturePolicyInfo.PolicyIdentifier = "https://tribunet.hacienda.go.cr/docs/esquemas/2016/v4.1/Resolucion_Comprobantes_Electronicos_DGT-R-48-2016.pdf";
      //La propiedad PolicyHash es la misma para todos, es un cálculo en base al archivo pdf indicado en PolicyIdentifier
      parametros.SignaturePolicyInfo.PolicyHash = "Ohixl6upD6av8N7pEvDABhEL6hM=";
      parametros.SignaturePackaging = SignaturePackaging.ENVELOPED;
      parametros.DataFormat = new DataFormat();
      parametros.Signer = new FirmaXadesNet.Crypto.Signer(cert);

      FirmaXadesNet.Signature.SignatureDocument docFirmado = xadesService.Sign(xmlDoc, parametros);
      return docFirmado.Document.OuterXml;
    }

    private X509Certificate2 GetCertificateByThumbprint(object thumbprintCertificado)
    {
      throw new NotImplementedException();
    }

    private HaciendaMessage creatMessage(string haciendaKey, Person emitter, Person recepient, string singedXMLInBase64)
    {
      return new HaciendaMessage
      {
        clave = haciendaKey,
        fecha = DateTime.Now.ToString("yyyy-MM-dd'T'HH:mm:ssZ"),
        emisor = emitter,
        receptor = recepient,
        comprobanteXml = singedXMLInBase64
      };
    }

    private string generateKey(Bill bill)
    {
      var currentDate = DateTime.Now;
      var Consecutivo = GetFormatedConsecutive(bill.consecutive);
      return new StringBuilder().Append(COUNTRY_CODE)
                                  .Append(currentDate.Day.ToString().PadLeft(2, '0'))
                                  .Append(currentDate.Month.ToString().PadLeft(2, '0'))
                                  .Append(currentDate.Year.ToString().Substring(2))
                                  .Append(_identificationNumber.PadLeft(12, '0'))
                                  .Append(Consecutivo)
                                  .Append('1')
                                  .Append(CreaCodigoSeguridad(Consecutivo))
                                  .ToString();
    }

    private string GetFormatedConsecutive(long consecutive)
    {
      return new StringBuilder().Append("001")
                                .Append("00001")
                                .Append("04")
                                .Append(consecutive.ToString().PadLeft(10, '0')).ToString();
    }

    public static string CreaCodigoSeguridad(string consecutivo)
    {
      try
      {
        var currentDate = DateTime.Now;

        string concatenado = new StringBuilder().Append("001")
                            .Append("01")
                            .Append("01")
                            .Append(currentDate.ToString("yyyyMMddHHmmss"))
                            .Append(consecutivo.PadLeft(10, '0'))
                            .ToString();

        int calculo = 0;
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(0, 1)) * 3));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(1, 1)) * 2));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(2, 1)) * 9));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(3, 1)) * 8));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(4, 1)) * 7));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(5, 1)) * 6));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(6, 1)) * 5));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(7, 1)) * 4));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(8, 1)) * 3));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(9, 1)) * 2));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(10, 1)) * 9));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(11, 1)) * 8));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(12, 1)) * 7));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(13, 1)) * 6));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(14, 1)) * 5));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(15, 1)) * 4));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(16, 1)) * 3));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(17, 1)) * 2));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(18, 1)) * 9));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(19, 1)) * 8));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(20, 1)) * 7));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(21, 1)) * 6));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(22, 1)) * 5));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(23, 1)) * 4));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(24, 1)) * 3));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(25, 1)) * 2));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(26, 1)) * 9));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(27, 1)) * 8));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(28, 1)) * 7));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(29, 1)) * 6));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(30, 1)) * 5));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(31, 1)) * 4));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(32, 1)) * 3));
        calculo = (calculo
                    + (int.Parse(concatenado.Substring(33, 1)) * 2));
        int mDV = 0;
        int digitoMod = 0;
        digitoMod = (calculo % 11);
        if (((digitoMod == 0)
                    || (digitoMod == 1)))
        {
          mDV = 0;
        }
        else
        {
          mDV = (11 - digitoMod);
        }

        return (consecutivo.Substring(7, 2).PadLeft(2, '0')
                    + (calculo.ToString().PadLeft(5, '0') + mDV.ToString()));
      }
      catch (Exception ex)
      {
        throw ex;
      }

    }

    public static string Base64_Encode(string str)
    {
      byte[] encbuff = System.Text.Encoding.UTF8.GetBytes(str);
      return Convert.ToBase64String(encbuff);
    }
  }

  internal class Token
  {
    public string access_token { get; set; } = string.Empty;
    public string token_type { get; set; } = string.Empty;
    public int expires_in { get; set; }
    public string refresh_token { get; set; } = string.Empty;
  }
}
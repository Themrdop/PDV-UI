using System.Text;
using System.Text.Json.Nodes;
using FirmaXadesNet;
using FirmaXadesNet.Signature.Parameters;
using FirmaXadesNet.Crypto;
using FirmaXadesNet.Utils;
using FirmaXadesNet.Signature;
using System.Xml.Serialization;

namespace Products.API.ElectronicBill
{
    public class ElectronicBill : IElectronicBill
    {
        private const string COUNTRY_CODE = "506";
        public const string ENDPOINT = @"https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1";
        public const string JWT_ENDPOINT = @"https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token";

        private readonly static HttpClient httpClient = new HttpClient(); 
        private readonly string _userName;
        private readonly string _password;
        private readonly string _identificationNumber;
        private SignatureDocument _signatureDocument;

        public ElectronicBill(string userName, string password, string identificationNumber)
        {
            _userName = userName;
            _password = password;
            _identificationNumber = identificationNumber;
        }

        public async Task<Bill> SendElectronicBill(Bill bill, CancellationToken cancellationToken)
        {
            string haciendaKey = generateKey(bill);
            string singedXML = singXML(GetXMLDocument(haciendaKey, bill));
            string singedXMLInBase64 = Base64_Encode(singedXML);
            HaciendaMessage haciendaMessage = creatMessage(haciendaKey,bill.electronicBill.emitter, bill.electronicBill.recepient, singedXMLInBase64);
            HttpResponseMessage result = await sendToHacienda(haciendaMessage, cancellationToken);

            switch (result.StatusCode)
            {
                case System.Net.HttpStatusCode.OK:
                    bill.electronicBill.location = result.Headers.Location;
                break;

                case System.Net.HttpStatusCode.BadRequest:
                    bill.electronicBill.errorMessages = result.ReasonPhrase;
                break;
                default:
                break;
            }

            return bill;

        }

        private string GetXMLDocument(string haciendaKey, Bill bill)
        {
            string xmlDocument = string.Empty;

            var msjHacienda = new MensajeHacienda{
                Clave = haciendaKey, 
                TipoIdentificacionEmisor = (MensajeHaciendaTipoIdentificacionEmisor)bill.electronicBill.emitter,
                TipoIdentificacionReceptor = (MensajeHaciendaTipoIdentificacionReceptor)bill.electronicBill.recepient,
                NumeroCedulaEmisor = bill.electronicBill.emitter.numeroIdentificacion,
                NumeroCedulaReceptor = bill.electronicBill.recepient.numeroIdentificacion,
                NombreReceptor = bill.electronicBill.recepient.name,
                NombreEmisor = bill.electronicBill.emitter.name,
                TipoIdentificacionReceptorSpecified = true,
                DetalleMensaje = string.Empty,
                MontoTotalImpuesto = bill.tax,
                MontoTotalImpuestoSpecified = true,
                TotalFactura = bill.total,
            };

            using(var stringwriter = new System.IO.StringWriter())
            { 
                var serializer = new XmlSerializer(typeof(MensajeHacienda));
                serializer.Serialize(stringwriter, msjHacienda);
                xmlDocument = stringwriter.ToString();
            }

            return xmlDocument;
        }

        private async Task<HttpResponseMessage> sendToHacienda(HaciendaMessage haciendaMessage, CancellationToken cancellationToken)
        {
            string token = await getToken(cancellationToken);
            httpClient.DefaultRequestHeaders.Add("content-type", "application/javascript");
            httpClient.DefaultRequestHeaders.Add("Authorization", "bearer " + token);
            return await httpClient.PostAsJsonAsync<HaciendaMessage>(ENDPOINT + "/recepcion",haciendaMessage,cancellationToken: cancellationToken);
        }

        private async Task<string> getToken(CancellationToken cancellationToken)
        {
            Dictionary<string,string> values = new();
            values.Add("grant_type", "password");
            values.Add("client_id", "api-stag");
            values.Add("client_secret", "");
            values.Add("scope", "");
            values.Add("username", _userName);
            values.Add("password", _password);
            httpClient.DefaultRequestHeaders.Add("content-type", "application/x-www-form-urlencoded");
            var content = new FormUrlEncodedContent(values);
            var response = await httpClient.PostAsync(JWT_ENDPOINT, content);
            var responseString = await response.Content.ReadAsStringAsync();
            JsonNode jObject = JsonObject.Parse(responseString);
            return (string)jObject["access_token"];
        }

        private string singXML(string xmlDoc)
        {
            XadesService xadesService = new XadesService();
            SignatureParameters parametri = new SignatureParameters();
            parametri.SignatureMethod = SignatureMethod.RSAwithSHA512;
            parametri.SigningDate = DateTime.Now;

            var sc = new SignatureCommitment(SignatureCommitmentType.ProofOfOrigin);
            parametri.SignatureCommitments.Add(sc);

            parametri.SignaturePackaging = SignaturePackaging.ENVELOPED;

            using (parametri.Signer = new Signer(CertUtil.SelectCertificate()))
            {
                _signatureDocument = xadesService.Sign(xmlDoc, parametri);
            }

            return _signatureDocument.Document.OuterXml;
        }

        private HaciendaMessage creatMessage(string haciendaKey, Person emitter, Person recepient, string singedXMLInBase64)
        {
            return new HaciendaMessage{clave = haciendaKey, 
                                       fecha = DateTime.Now.ToString("yyyy-MM-dd'T'HH:mm:ssZ"), 
                                       emisor = emitter, 
                                       receptor = recepient,
                                       comprobanteXml = singedXMLInBase64};
        }

        private string generateKey(Bill bill)
        {
            var currentDate = DateTime.Now;
            return new StringBuilder().Append(COUNTRY_CODE)
                                      .Append(currentDate.Day.ToString().PadLeft(2,'0'))
                                      .Append(currentDate.Month.ToString().PadLeft(2,'0'))
                                      .Append(currentDate.Year.ToString().Substring(2))
                                      .Append(_identificationNumber)
                                      .Append(bill.consecutive)
                                      .Append('1')
                                      .Append("99999999")//TODO: how to generate the code
                                      .ToString();
        }

        public static string Base64_Encode(string str)
        {
            byte[] encbuff = System.Text.Encoding.UTF8.GetBytes(str);
            return Convert.ToBase64String(encbuff);
        }
    }
}